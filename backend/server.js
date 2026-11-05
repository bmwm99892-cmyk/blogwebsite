const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'premium_blog_secret_key_2026';

// Initialize MySQL database & tables
db.initDB();

// Authentication Middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const [rows] = await db.query(
      'SELECT id, name, email, createdAt FROM users WHERE id = ?',
      [decoded.id]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Unauthorized: User not found' });
    }

    const user = rows[0];
    user._id = user.id.toString(); // For frontend compatibility
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

// ==================== AUTH ROUTES ====================

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );

    res.status(201).json({
      message: 'User registered successfully',
      userId: result.insertId
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({
      token,
      user: {
        id: user.id,
        _id: user.id.toString(),
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Get Current User
app.get('/api/auth/me', auth, (req, res) => {
  res.json(req.user);
});

// ==================== BLOG ROUTES ====================

// GET all blogs (supports ?search= and ?category=)
app.get('/api/blogs', async (req, res) => {
  try {
    const { search, category } = req.query;
    let sql = `
      SELECT b.*, u.name AS authorName, u.email AS authorEmail
      FROM blogs b
      LEFT JOIN users u ON b.authorId = u.id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      sql += ' AND (b.title LIKE ? OR b.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (category && category !== 'All') {
      sql += ' AND b.category = ?';
      params.push(category);
    }

    sql += ' ORDER BY b.createdAt DESC';

    const [rows] = await db.query(sql, params);

    // Format author object and provide both id & _id
    const blogs = rows.map((b) => ({
      id: b.id,
      _id: b.id.toString(),
      title: b.title,
      description: b.description,
      content: b.content,
      image: b.image,
      category: b.category,
      createdAt: b.createdAt,
      updatedAt: b.updatedAt,
      author: {
        id: b.authorId,
        _id: b.authorId ? b.authorId.toString() : null,
        name: b.authorName || 'Staff Contributor'
      }
    }));

    res.json(blogs);
  } catch (err) {
    console.error('Error fetching blogs:', err);
    res.status(500).json({ error: 'Error fetching blogs' });
  }
});

// GET single blog
app.get('/api/blogs/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      `
      SELECT b.*, u.name AS authorName, u.email AS authorEmail
      FROM blogs b
      LEFT JOIN users u ON b.authorId = u.id
      WHERE b.id = ?
    `,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    const b = rows[0];
    const blog = {
      id: b.id,
      _id: b.id.toString(),
      title: b.title,
      description: b.description,
      content: b.content,
      image: b.image,
      category: b.category,
      createdAt: b.createdAt,
      updatedAt: b.updatedAt,
      author: {
        id: b.authorId,
        _id: b.authorId ? b.authorId.toString() : null,
        name: b.authorName || 'Staff Contributor'
      }
    };

    res.json(blog);
  } catch (err) {
    console.error('Error fetching blog:', err);
    res.status(500).json({ error: 'Error fetching blog' });
  }
});

// Flexible Authentication Middleware for Blog Creation (supports logged-in users & guest contributors)
const flexibleAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const [rows] = await db.query(
          'SELECT id, name, email, createdAt FROM users WHERE id = ?',
          [decoded.id]
        );
        if (rows.length > 0) {
          const user = rows[0];
          user._id = user.id.toString();
          req.user = user;
          return next();
        }
      } catch (err) {
        // Invalid token; proceed to contributor assignment below
      }
    }

    // If no valid token, use provided author name or default
    const authorName = req.body.authorName || 'Editorial Contributor';
    const defaultEmail = 'contributor@thejournal.com';

    // Find or create default contributor user in MySQL
    let [contrib] = await db.query('SELECT id, name, email FROM users WHERE email = ?', [defaultEmail]);
    if (contrib.length === 0) {
      const hash = await bcrypt.hash('editorial_journal_pass_2026', 10);
      const [result] = await db.query(
        'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
        [authorName, defaultEmail, hash]
      );
      req.user = {
        id: result.insertId,
        _id: result.insertId.toString(),
        name: authorName,
        email: defaultEmail
      };
    } else {
      req.user = {
        id: contrib[0].id,
        _id: contrib[0].id.toString(),
        name: authorName || contrib[0].name,
        email: contrib[0].email
      };
    }
    next();
  } catch (err) {
    console.error('flexibleAuth error:', err);
    next();
  }
};

// POST Create blog
app.post('/api/blogs', flexibleAuth, async (req, res) => {
  try {
    const { title, description, content, image, category, authorName } = req.body;
    if (!title || !description || !content || !image || !category) {
      return res.status(400).json({ error: 'All fields (Title, Category, Lead Image, Summary, Content) are required.' });
    }

    const effectiveAuthorName = authorName || req.user?.name || 'Staff Contributor';
    const authorId = req.user?.id || 1;

    const [result] = await db.query(
      `
      INSERT INTO blogs (title, description, content, image, category, authorId)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
      [title, description, content, image, category, authorId]
    );

    const newBlog = {
      id: result.insertId,
      _id: result.insertId.toString(),
      title,
      description,
      content,
      image,
      category,
      authorId: authorId,
      author: {
        id: authorId,
        _id: authorId.toString(),
        name: effectiveAuthorName
      },
      createdAt: new Date()
    };

    res.status(201).json(newBlog);
  } catch (err) {
    console.error('Error creating blog:', err);
    res.status(400).json({ error: 'Error creating blog: ' + err.message });
  }
});

// PUT Update blog
app.put('/api/blogs/:id', auth, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM blogs WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    const blog = rows[0];
    if (blog.authorId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: You can only edit your own blogs' });
    }

    const { title, description, content, image, category } = req.body;
    await db.query(
      `
      UPDATE blogs
      SET title = COALESCE(?, title),
          description = COALESCE(?, description),
          content = COALESCE(?, content),
          image = COALESCE(?, image),
          category = COALESCE(?, category)
      WHERE id = ?
    `,
      [title, description, content, image, category, req.params.id]
    );

    res.json({ message: 'Blog updated successfully' });
  } catch (err) {
    console.error('Error updating blog:', err);
    res.status(400).json({ error: 'Error updating blog' });
  }
});

// DELETE blog
app.delete('/api/blogs/:id', auth, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM blogs WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    const blog = rows[0];
    if (blog.authorId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: You can only delete your own blogs' });
    }

    await db.query('DELETE FROM blogs WHERE id = ?', [req.params.id]);
    res.json({ message: 'Blog deleted successfully' });
  } catch (err) {
    console.error('Error deleting blog:', err);
    res.status(500).json({ error: 'Error deleting blog' });
  }
});

// ==================== CONTACT & NEWSLETTER ====================

// Contact API
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required' });
    }

    await db.query(
      'INSERT INTO contacts (name, email, subject, message) VALUES (?, ?, ?, ?)',
      [name, email, subject || '', message]
    );

    res.status(201).json({ message: 'Message sent successfully' });
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(400).json({ error: 'Error sending message' });
  }
});

// Newsletter Subscribe API
app.post('/api/newsletter/subscribe', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    await db.query('INSERT INTO newsletters (email) VALUES (?)', [email]);
    res.status(201).json({ message: 'Subscribed successfully' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Email already subscribed' });
    }
    console.error('Error subscribing:', err);
    res.status(400).json({ error: 'Error subscribing' });
  }
});

// ==================== SERVER STARTUP ====================
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} (MySQL Connected)`);
});
