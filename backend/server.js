const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'premium_blog_secret_key_2026';
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'admin@thejournal.com').trim().toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '',
  port: Number(process.env.DB_PORT) || 3306,
  database: process.env.DB_NAME || 'blogwebsite',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

let pool = null;

// Helper to query with automatic pool resolution
async function query(sql, params = []) {
  if (!pool) {
    throw new Error('Database pool not yet initialized.');
  }
  return pool.query(sql, params);
}

// Format row to ensure both id and _id exist for frontend compatibility
function formatItem(item) {
  if (!item) return item;
  const formatted = { ...item };
  if (formatted.id !== undefined && formatted._id === undefined) {
    formatted._id = formatted.id;
  }
  return formatted;
}

function formatItems(items) {
  if (!Array.isArray(items)) return [];
  return items.map(formatItem);
}

// ==================== DATABASE INITIALIZATION & SEEDING ====================
async function initDatabase() {
  try {
    // 1. Connect without database to ensure DB creation
    const connection = await mysql.createConnection({
      host: DB_CONFIG.host,
      user: DB_CONFIG.user,
      password: DB_CONFIG.password,
      port: DB_CONFIG.port
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_CONFIG.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await connection.end();

    // 2. Initialize main connection pool
    pool = mysql.createPool(DB_CONFIG);

    // 3. Create Tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'user') DEFAULT 'user',
        status ENUM('active', 'blocked') DEFAULT 'active',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(150) NOT NULL UNIQUE,
        slug VARCHAR(150) NOT NULL UNIQUE,
        description TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS blogs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        content LONGTEXT NOT NULL,
        image TEXT NOT NULL,
        category VARCHAR(150) NOT NULL,
        authorId INT NOT NULL,
        status ENUM('published', 'draft') DEFAULT 'published',
        featured BOOLEAN DEFAULT FALSE,
        views INT DEFAULT 0,
        likes INT DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_category (category),
        INDEX idx_status (status),
        INDEX idx_featured (featured),
        FOREIGN KEY (authorId) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        blogId INT NOT NULL,
        userId INT NOT NULL,
        authorName VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        parentId INT DEFAULT NULL,
        status ENUM('approved', 'pending', 'hidden') DEFAULT 'approved',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (blogId) REFERENCES blogs(id) ON DELETE CASCADE,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS likes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        blogId INT NOT NULL,
        userId INT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uq_blog_user_like (blogId, userId),
        FOREIGN KEY (blogId) REFERENCES blogs(id) ON DELETE CASCADE,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS views (
        id INT AUTO_INCREMENT PRIMARY KEY,
        blogId INT NOT NULL,
        visitorHash VARCHAR(64) NOT NULL,
        viewedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_blog_visitor (blogId, visitorHash, viewedAt),
        FOREIGN KEY (blogId) REFERENCES blogs(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS newsletters (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        subscribedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    console.log('✅ MySQL Tables Verified & Ready');

    // 4. Seed Admin Accounts
    const defaultAdmins = [
      { name: 'The Journal Editor', email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
      { name: 'Abdul Hanan (Admin)', email: 'bmwm99892@gmail.com', password: 'admin123' }
    ];

    for (const adm of defaultAdmins) {
      const hashed = await bcrypt.hash(adm.password, 10);
      const [existing] = await pool.query('SELECT * FROM users WHERE email = ?', [adm.email]);
      if (existing.length === 0) {
        await pool.query(
          'INSERT INTO users (name, email, password, role, status) VALUES (?, ?, ?, "admin", "active")',
          [adm.name, adm.email, hashed]
        );
        console.log(`👑 MySQL Admin Initialized: ${adm.email} (Password: ${adm.password})`);
      } else {
        await pool.query(
          'UPDATE users SET role = "admin", status = "active", password = ? WHERE email = ?',
          [hashed, adm.email]
        );
        console.log(`👑 MySQL Admin Synced: ${adm.email} (Password: ${adm.password})`);
      }
    }

    // 5. Seed Default Categories
    const defaultCategories = [
      ['Design', 'design', 'Spatial philosophy, architectural stillness, and modern typography.'],
      ['Technology', 'technology', 'Algorithmic culture, computational frontiers, and synthetic systems.'],
      ['Business', 'business', 'Regenerative capital, macroeconomics, and enduring enterprise.'],
      ['Lifestyle', 'lifestyle', 'Slow living, gastronomy, contemplative wellness, and mindful ritual.'],
      ['Travel', 'travel', 'Remote landscapes, tactile expeditions, and cultural geographies.'],
      ['Innovation', 'innovation', 'Material sciences, craft revival, and emerging societal paradigms.'],
      ['Programming', 'programming', 'Software architecture, systems craftsmanship, and expressive code.'],
      ['Artificial Intelligence', 'artificial-intelligence', 'Generative algorithms, machine cognition, and human agency.']
    ];

    for (const [name, slug, description] of defaultCategories) {
      await pool.query(
        'INSERT IGNORE INTO categories (name, slug, description) VALUES (?, ?, ?)',
        [name, slug, description]
      );
    }

    // 6. Seed Editorial Blogs if empty
    const [blogRows] = await pool.query('SELECT COUNT(*) as count FROM blogs');
    if (blogRows[0].count === 0) {
      const [adminRows] = await pool.query('SELECT id FROM users WHERE email = ?', [ADMIN_EMAIL]);
      const authorId = adminRows.length > 0 ? adminRows[0].id : 1;

      const seedBlogs = [
        [
          "The Architecture of Silence: Designing Spaces in an Overstimulated World",
          "An exploration into contemporary minimalist architecture, examining how light, void, and tactile materiality shape modern human consciousness.",
          `Architecture has long been an instrument of proclamation — monumentality, power, technological prowess. Yet in our hyper-connected epoch, where sensory inundation is chronic and unavoidable, a radical counter-movement has taken root: the architecture of silence.\n\nPioneered by practitioners from Kyoto to Zurich, this aesthetic does not celebrate emptiness for mere asceticism. Rather, it treats stillness as a vital spatial commodity. By reducing the visual syntax to raw limestone, untreated cedar, and daylight tempered by linen scrims, these architects construct sanctuaries from psychological noise.\n\n"We do not design walls to enclose space," notes architect Elena Vasquez. "We design them to hold a pause. When you step into a room where nothing demands your attention, the mind stops defending itself and begins to inhabit the present."\n\nThe psychological implications are profound. Neurological studies in environmental ergonomics reveal that spaces with restrained visual textures lower cortisol levels and foster associative, long-horizon thinking. Light becomes the primary ornament: a low winter sun grazing across hand-troweled lime plaster does what no digital interface ever could.\n\nAs our cities grow denser and our devices louder, the ultimate luxury is no longer acreage or ostentatious finishes. It is silence, carved into stone and preserved in the shadows between walls.`,
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80",
          "Design",
          authorId,
          "published",
          1,
          1420,
          86
        ],
        [
          "The Renaissance of Independent Craft in the Age of Synthetic Intelligence",
          "Why bespoke joinery, analogue typography, and tactile arts are commanding unprecedented cultural value as algorithmic abundance surges.",
          `In an era where synthetic intelligence can generate hyper-realistic imagery in milliseconds, the human relationship with material objects is undergoing a silent revolution.\n\nThe value proposition of physical craftsmanship has inverted. Where mass automation once democratized utility, algorithmic automation has turned perfection into a commodity. What collectors, patrons, and readers now seek is the irreproducible artifact: the irregular grain of hand-planed walnut, the heavy bite of lead type pressed into damp cotton rag, the slight asymmetry of ceramic fired in wood-fueled kilns.\n\nThese imperfections are not defects; they are forensic evidence of human presence. Each deliberate flaw tells the story of time spent, of hands guided by intuition rather than neural weights. In a world saturated with synthetic perfection, the handmade object remains the last authentic anchor of human truth.`,
          "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=1600&q=80",
          "Innovation",
          authorId,
          "published",
          1,
          980,
          54
        ],
        [
          "The Ephemeral Landscape: Solitary Journeys Through Iceland's Black Sands",
          "Reflections on travelling through basalt deserts, glacial lagoons, and the timeless volcanic geography of the North Atlantic.",
          `To travel across Iceland's southern coastline is to experience a landscape that feels stripped of human pretense. Between the thundering cascade of Skógafoss and the vast expanse of Sólheimasandur, black basalt sand stretches toward an slate-grey horizon, punctuated only by drift ice and the pale curl of sub-polar breakers.\n\nHere, scale ceases to conform to familiar domestic cues. Distances are deceptive; a mountain range that appears ten minutes away demands an entire morning's trek across wind-carved lava fields. The silence is visceral, broken only by glacial water carving crystalline veins through dark volcanic earth.\n\nIn our modern travel culture, dominated by checklist itineraries and synchronized destinations, these barren coastal plains offer something increasingly rare: an uncurated confrontation with the elemental earth.`,
          "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1600&q=80",
          "Travel",
          authorId,
          "published",
          0,
          840,
          42
        ],
        [
          "The Quiet Disruption: How Patient Capital is Outperforming Hyper-Growth",
          "A macroeconomic inquiry into enduring enterprise, slow capital compounding, and why sustainable balance sheets endure market cycles.",
          `For the past two decades, technology financing worshipped a single metric: velocity. Founders were incentivized to consume capital at exponential burn rates, pursuing market dominance before unit economics were proved.\n\nToday, a quiet counter-revolution is gaining momentum among global asset allocators. Patient capital — funds structured for decade-long hold horizons, prioritizing operating profitability and organic cash flow reinvestment — is consistently producing superior risk-adjusted returns.\n\nWhen cost of capital is no longer zero, durability replaces blitzscaling. Companies built on authentic operational margins and deep customer trust do not merely survive macroeconomic contractions; they acquire distressed assets and consolidate sectors while debt-heavy competitors flounder.`,
          "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80",
          "Business",
          authorId,
          "published",
          0,
          710,
          38
        ],
        [
          "The Mindful Table: Rediscovering Seasonal Gastronomy and Living Fermentation",
          "An intimate dispatch from Northern California kitchens exploring sourdough levains, seasonal foraging, and the preservation of heirloom varieties.",
          `True gastronomy begins far before the heat meets the pan. It begins in the dark humus of winter soil, in the patient microbial activity of wild yeast, and in the deliberate rhythm of cooking in accordance with seasonal scarcity.\n\nIn our conversation with master bakers and regenerative growers, a singular theme emerges: patience as culinary syntax. When bread is allowed forty-eight hours of cold fermentation, wheat unlocks complex enzymatic sweetness that rapid commercial leaveners obliterate. When vegetables are harvested at frost rather than artificially ripened in transit, sugar balances peak naturally.\n\nEating mindfully is not a dietary regimen — it is an active meditation and a tangible vote for the biological richness of our planet.`,
          "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1600&q=80",
          "Lifestyle",
          authorId,
          "published",
          0,
          630,
          29
        ],
        [
          "Algorithmic Poetics: Exploring Human-Machine Synthesis in Contemporary Art",
          "Examining the creative tension where machine learning transformers meet classical fine art composition.",
          `When algorithmic tools were first integrated into creative studios, critics warned of an imminent homogenization of aesthetics. Yet in the ateliers of vanguard new media artists, computation has not replaced human discernment — it has elevated it to an orchestral tier.\n\nArtists no longer manipulate physical pigments alone; they curate latent spaces, sculpt algorithmic training datasets, and guide stochastic models toward unprecedented visual poetic expressions.\n\nThe resulting works are neither purely synthetic nor purely manual; they represent an emergent, hybrid sensibility that reflects our integrated existence at the interface of flesh and silicon.`,
          "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80",
          "Technology",
          authorId,
          "published",
          0,
          1120,
          77
        ]
      ];

      for (const blog of seedBlogs) {
        await pool.query(`
          INSERT INTO blogs (title, description, content, image, category, authorId, status, featured, views, likes)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, blog);
      }
      console.log('✅ 6 Editorial Seed Blogs Created in MySQL');
    }

  } catch (err) {
    console.error('❌ MySQL Connection / Setup Error:', err.message);
    console.warn('⚠️ Please ensure MySQL is running (e.g. via XAMPP or MySQL Service) and configured in backend/.env');
  }
}

initDatabase();

// ==================== AUTHENTICATION MIDDLEWARE ====================
const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader) return res.status(401).json({ error: 'No authentication token provided.' });

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET);

    const [rows] = await query('SELECT id, name, email, role, status FROM users WHERE id = ?', [decoded.id]);
    if (rows.length === 0) return res.status(401).json({ error: 'User does not exist.' });

    const user = formatItem(rows[0]);
    if (user.status === 'blocked') {
      return res.status(403).json({ error: 'Your account has been deactivated. Contact support.' });
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired session token.' });
  }
};

const adminOnly = (req, res, next) => {
  auth(req, res, () => {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ error: 'Access denied: Administrator privileges required.' });
    }
  });
};

// ==================== AUTHENTICATION APIS ====================

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const [existing] = await query('SELECT id FROM users WHERE email = ?', [cleanEmail]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await query(
      'INSERT INTO users (name, email, password, role, status) VALUES (?, ?, ?, "user", "active")',
      [name.trim(), cleanEmail, hashedPassword]
    );

    const newUser = { id: result.insertId, _id: result.insertId, name: name.trim(), email: cleanEmail, role: 'user' };
    res.status(201).json({
      message: 'Account registered successfully.',
      user: newUser
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanPassword = String(password).trim();

    // Check if master admin
    const isMasterAdminEmail = (cleanEmail === ADMIN_EMAIL || cleanEmail === 'bmwm99892@gmail.com');
    const isMasterAdmin = isMasterAdminEmail && (cleanPassword === ADMIN_PASSWORD || cleanPassword === 'admin123');

    let [rows] = await query('SELECT * FROM users WHERE email = ?', [cleanEmail]);
    let user = rows.length > 0 ? rows[0] : null;

    if (isMasterAdmin) {
      const hashed = await bcrypt.hash(cleanPassword, 10);
      if (!user) {
        const [insertRes] = await query(
          'INSERT INTO users (name, email, password, role, status) VALUES (?, ?, ?, "admin", "active")',
          [cleanEmail.includes('bmwm') ? 'Abdul Hanan (Admin)' : 'The Journal Editor', cleanEmail, hashed]
        );
        user = { id: insertRes.insertId, name: cleanEmail.includes('bmwm') ? 'Abdul Hanan (Admin)' : 'The Journal Editor', email: cleanEmail, role: 'admin', status: 'active' };
      } else {
        await query('UPDATE users SET role = "admin", status = "active", password = ? WHERE id = ?', [hashed, user.id]);
        user.role = 'admin';
        user.status = 'active';
      }
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(cleanPassword, user.password);
    if (!isMatch && !isMasterAdmin) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (user.status === 'blocked') {
      return res.status(403).json({ error: 'Your account has been deactivated. Please contact administration.' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login: ' + err.message });
  }
});

// Current User Profile
app.get('/api/auth/me', auth, (req, res) => {
  res.json(req.user);
});

// ==================== BLOG REST APIS ====================

// GET all blogs
app.get('/api/blogs', async (req, res) => {
  try {
    const { search, category, status } = req.query;
    let sql = `
      SELECT b.*, u.name as authorName, u.email as authorEmail
      FROM blogs b
      JOIN users u ON b.authorId = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      sql += ' AND b.status = ?';
      params.push(status);
    } else {
      sql += ' AND b.status = "published"';
    }

    if (category && category.toLowerCase() !== 'all') {
      sql += ' AND LOWER(b.category) = LOWER(?)';
      params.push(category);
    }

    if (search) {
      sql += ' AND (b.title LIKE ? OR b.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY b.createdAt DESC';

    const [rows] = await query(sql, params);

    const blogs = rows.map((r) => ({
      ...formatItem(r),
      author: {
        id: r.authorId,
        _id: r.authorId,
        name: r.authorName,
        email: r.authorEmail
      }
    }));

    res.json(blogs);
  } catch (err) {
    console.error('Error fetching blogs:', err);
    res.status(500).json({ error: 'Error fetching articles.' });
  }
});

// GET single blog by ID
app.get('/api/blogs/:id', async (req, res) => {
  try {
    const blogId = Number(req.params.id);
    if (isNaN(blogId)) {
      return res.status(404).json({ error: 'Blog not found.' });
    }

    const [rows] = await query(`
      SELECT b.*, u.name as authorName, u.email as authorEmail
      FROM blogs b
      JOIN users u ON b.authorId = u.id
      WHERE b.id = ?
    `, [blogId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Article not found.' });
    }

    const r = rows[0];
    const blog = {
      ...formatItem(r),
      author: {
        id: r.authorId,
        _id: r.authorId,
        name: r.authorName,
        email: r.authorEmail
      }
    };

    res.json(blog);
  } catch (err) {
    console.error('Error fetching blog:', err);
    res.status(500).json({ error: 'Server error retrieving article.' });
  }
});

// POST Create blog
app.post('/api/blogs', auth, async (req, res) => {
  try {
    const { title, description, content, image, category, status, featured } = req.body;
    if (!title || !description || !content || !image || !category) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const [result] = await query(`
      INSERT INTO blogs (title, description, content, image, category, authorId, status, featured, views, likes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0)
    `, [
      title.trim(),
      description.trim(),
      content,
      image.trim(),
      category.trim(),
      req.user.id,
      status || 'published',
      featured ? 1 : 0
    ]);

    const newBlogId = result.insertId;
    const [createdRows] = await query(`
      SELECT b.*, u.name as authorName, u.email as authorEmail
      FROM blogs b
      JOIN users u ON b.authorId = u.id
      WHERE b.id = ?
    `, [newBlogId]);

    const r = createdRows[0];
    res.status(201).json({
      ...formatItem(r),
      author: { id: r.authorId, _id: r.authorId, name: r.authorName, email: r.authorEmail }
    });
  } catch (err) {
    console.error('Error creating blog:', err);
    res.status(400).json({ error: 'Error creating blog: ' + err.message });
  }
});

// PUT Update blog
app.put('/api/blogs/:id', auth, async (req, res) => {
  try {
    const blogId = Number(req.params.id);
    const [rows] = await query('SELECT * FROM blogs WHERE id = ?', [blogId]);
    if (rows.length === 0) return res.status(404).json({ error: 'Blog not found.' });

    const blog = rows[0];
    if (blog.authorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: You can only edit your own blogs.' });
    }

    const { title, description, content, image, category, status, featured } = req.body;
    const updatedTitle = title !== undefined ? title.trim() : blog.title;
    const updatedDesc = description !== undefined ? description.trim() : blog.description;
    const updatedContent = content !== undefined ? content : blog.content;
    const updatedImage = image !== undefined ? image.trim() : blog.image;
    const updatedCat = category !== undefined ? category.trim() : blog.category;
    const updatedStatus = status !== undefined ? status : blog.status;
    const updatedFeatured = featured !== undefined ? (featured ? 1 : 0) : blog.featured;

    await query(`
      UPDATE blogs
      SET title = ?, description = ?, content = ?, image = ?, category = ?, status = ?, featured = ?
      WHERE id = ?
    `, [updatedTitle, updatedDesc, updatedContent, updatedImage, updatedCat, updatedStatus, updatedFeatured, blogId]);

    const [updatedRows] = await query(`
      SELECT b.*, u.name as authorName, u.email as authorEmail
      FROM blogs b
      JOIN users u ON b.authorId = u.id
      WHERE b.id = ?
    `, [blogId]);

    const r = updatedRows[0];
    res.json({
      ...formatItem(r),
      author: { id: r.authorId, _id: r.authorId, name: r.authorName, email: r.authorEmail }
    });
  } catch (err) {
    console.error('Error updating blog:', err);
    res.status(400).json({ error: 'Error updating blog.' });
  }
});

// DELETE blog
app.delete('/api/blogs/:id', auth, async (req, res) => {
  try {
    const blogId = Number(req.params.id);
    const [rows] = await query('SELECT * FROM blogs WHERE id = ?', [blogId]);
    if (rows.length === 0) return res.status(404).json({ error: 'Blog not found.' });

    const blog = rows[0];
    if (blog.authorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: You can only delete your own blogs.' });
    }

    await query('DELETE FROM blogs WHERE id = ?', [blogId]);
    res.json({ message: 'Blog deleted successfully.' });
  } catch (err) {
    console.error('Error deleting blog:', err);
    res.status(500).json({ error: 'Error deleting blog.' });
  }
});

// ==================== VIEWS SYSTEM (Deduplicated) ====================

app.post('/api/blogs/:id/view', async (req, res) => {
  try {
    const blogId = Number(req.params.id);
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'anonymous';
    const visitorHash = crypto.createHash('sha256').update(`${ip}-${userAgent}`).digest('hex');

    // Check duplicate view within 2 hours
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const [recent] = await query(
      'SELECT id FROM views WHERE blogId = ? AND visitorHash = ? AND viewedAt > ? LIMIT 1',
      [blogId, visitorHash, twoHoursAgo]
    );

    if (recent.length > 0) {
      const [b] = await query('SELECT views FROM blogs WHERE id = ?', [blogId]);
      return res.json({ message: 'View already recorded within deduplication window.', views: b[0]?.views || 0 });
    }

    await query('INSERT INTO views (blogId, visitorHash) VALUES (?, ?)', [blogId, visitorHash]);
    await query('UPDATE blogs SET views = views + 1 WHERE id = ?', [blogId]);

    const [b] = await query('SELECT views FROM blogs WHERE id = ?', [blogId]);
    res.json({ message: 'View recorded.', views: b[0]?.views || 0 });
  } catch (err) {
    console.error('View tracking error:', err);
    res.status(500).json({ error: 'Error processing view metric.' });
  }
});

app.get('/api/blogs/:id/views', async (req, res) => {
  try {
    const blogId = Number(req.params.id);
    const [b] = await query('SELECT views FROM blogs WHERE id = ?', [blogId]);
    if (b.length === 0) return res.status(404).json({ error: 'Blog not found' });
    res.json({ views: b[0].views });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching views.' });
  }
});

// ==================== LIKE / UNLIKE SYSTEM ====================

app.post('/api/blogs/:id/like', auth, async (req, res) => {
  try {
    const blogId = Number(req.params.id);
    const userId = req.user.id;

    const [existing] = await query('SELECT id FROM likes WHERE blogId = ? AND userId = ?', [blogId, userId]);
    if (existing.length > 0) {
      const [b] = await query('SELECT likes FROM blogs WHERE id = ?', [blogId]);
      return res.status(400).json({ error: 'You have already liked this article.', likesCount: b[0]?.likes || 0 });
    }

    await query('INSERT INTO likes (blogId, userId) VALUES (?, ?)', [blogId, userId]);
    await query('UPDATE blogs SET likes = likes + 1 WHERE id = ?', [blogId]);

    const [b] = await query('SELECT likes FROM blogs WHERE id = ?', [blogId]);
    res.json({ message: 'Article liked successfully.', likesCount: b[0]?.likes || 0, isLiked: true });
  } catch (err) {
    console.error('Like error:', err);
    res.status(500).json({ error: 'Server error processing like action.' });
  }
});

app.delete('/api/blogs/:id/like', auth, async (req, res) => {
  try {
    const blogId = Number(req.params.id);
    const userId = req.user.id;

    const [result] = await query('DELETE FROM likes WHERE blogId = ? AND userId = ?', [blogId, userId]);
    if (result.affectedRows > 0) {
      await query('UPDATE blogs SET likes = GREATEST(0, likes - 1) WHERE id = ?', [blogId]);
    }

    const [b] = await query('SELECT likes FROM blogs WHERE id = ?', [blogId]);
    res.json({ message: 'Article unliked.', likesCount: b[0]?.likes || 0, isLiked: false });
  } catch (err) {
    console.error('Unlike error:', err);
    res.status(500).json({ error: 'Server error processing unlike action.' });
  }
});

app.get('/api/blogs/:id/likes', async (req, res) => {
  try {
    const blogId = Number(req.params.id);
    let isLiked = false;

    const authHeader = req.header('Authorization');
    if (authHeader) {
      try {
        const token = authHeader.replace('Bearer ', '');
        const decoded = jwt.verify(token, JWT_SECRET);
        const [likeCheck] = await query('SELECT id FROM likes WHERE blogId = ? AND userId = ?', [blogId, decoded.id]);
        isLiked = likeCheck.length > 0;
      } catch (e) {}
    }

    const [b] = await query('SELECT likes FROM blogs WHERE id = ?', [blogId]);
    res.json({ likesCount: b[0]?.likes || 0, isLiked });
  } catch (err) {
    res.status(500).json({ error: 'Error checking likes.' });
  }
});

// ==================== COMMENTS SYSTEM ====================

app.get('/api/blogs/:id/comments', async (req, res) => {
  try {
    const blogId = Number(req.params.id);
    const [rows] = await query(`
      SELECT c.*, u.name as userName, u.email as userEmail
      FROM comments c
      JOIN users u ON c.userId = u.id
      WHERE c.blogId = ? AND c.status = 'approved'
      ORDER BY c.createdAt ASC
    `, [blogId]);

    // Build hierarchical replies structure
    const commentMap = {};
    const rootComments = [];

    rows.forEach(r => {
      const commentObj = {
        ...formatItem(r),
        user: { id: r.userId, _id: r.userId, name: r.userName, email: r.userEmail },
        replies: []
      };
      commentMap[r.id] = commentObj;
    });

    rows.forEach(r => {
      if (r.parentId && commentMap[r.parentId]) {
        commentMap[r.parentId].replies.push(commentMap[r.id]);
      } else if (!r.parentId) {
        rootComments.push(commentMap[r.id]);
      }
    });

    res.json(rootComments);
  } catch (err) {
    console.error('Error fetching comments:', err);
    res.status(500).json({ error: 'Error retrieving comments.' });
  }
});

app.post('/api/blogs/:id/comments', auth, async (req, res) => {
  try {
    const blogId = Number(req.params.id);
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Comment body cannot be blank.' });
    }

    const [result] = await query(`
      INSERT INTO comments (blogId, userId, authorName, content, status)
      VALUES (?, ?, ?, ?, 'approved')
    `, [blogId, req.user.id, req.user.name, content.trim()]);

    const newId = result.insertId;
    const [c] = await query('SELECT * FROM comments WHERE id = ?', [newId]);

    const formatted = {
      ...formatItem(c[0]),
      user: { id: req.user.id, _id: req.user.id, name: req.user.name, email: req.user.email },
      replies: []
    };

    res.status(201).json(formatted);
  } catch (err) {
    console.error('Error adding comment:', err);
    res.status(400).json({ error: 'Error posting comment.' });
  }
});

app.post('/api/comments/:id/replies', auth, async (req, res) => {
  try {
    const parentId = Number(req.params.id);
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Reply text cannot be blank.' });
    }

    const [parents] = await query('SELECT blogId FROM comments WHERE id = ?', [parentId]);
    if (parents.length === 0) return res.status(404).json({ error: 'Parent comment not found.' });

    const blogId = parents[0].blogId;
    const [result] = await query(`
      INSERT INTO comments (blogId, userId, authorName, content, parentId, status)
      VALUES (?, ?, ?, ?, ?, 'approved')
    `, [blogId, req.user.id, req.user.name, content.trim(), parentId]);

    const newId = result.insertId;
    const [c] = await query('SELECT * FROM comments WHERE id = ?', [newId]);

    const formatted = {
      ...formatItem(c[0]),
      user: { id: req.user.id, _id: req.user.id, name: req.user.name, email: req.user.email }
    };

    res.status(201).json(formatted);
  } catch (err) {
    res.status(400).json({ error: 'Error adding reply.' });
  }
});

app.put('/api/comments/:id', auth, async (req, res) => {
  try {
    const commentId = Number(req.params.id);
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Comment content cannot be blank.' });
    }

    const [rows] = await query('SELECT * FROM comments WHERE id = ?', [commentId]);
    if (rows.length === 0) return res.status(404).json({ error: 'Comment not found.' });

    const comment = rows[0];
    if (comment.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: You can only edit your own comment.' });
    }

    await query('UPDATE comments SET content = ? WHERE id = ?', [content.trim(), commentId]);
    const [updated] = await query('SELECT * FROM comments WHERE id = ?', [commentId]);
    res.json(formatItem(updated[0]));
  } catch (err) {
    res.status(400).json({ error: 'Error updating comment.' });
  }
});

app.delete('/api/comments/:id', auth, async (req, res) => {
  try {
    const commentId = Number(req.params.id);
    const [rows] = await query('SELECT * FROM comments WHERE id = ?', [commentId]);
    if (rows.length === 0) return res.status(404).json({ error: 'Comment not found.' });

    const comment = rows[0];
    if (comment.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: You can only delete your own comment.' });
    }

    await query('DELETE FROM comments WHERE id = ? OR parentId = ?', [commentId, commentId]);
    res.json({ message: 'Comment and replies removed successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Error removing comment.' });
  }
});

// ==================== ADMIN DASHBOARD & ANALYTICS ====================

app.get('/api/admin/dashboard', adminOnly, async (req, res) => {
  try {
    const [blogCounts] = await query(`
      SELECT 
        COUNT(*) as totalBlogs,
        SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) as publishedBlogs,
        SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draftBlogs,
        COALESCE(SUM(views), 0) as totalViews,
        COALESCE(SUM(likes), 0) as totalLikes
      FROM blogs
    `);

    const [commentCount] = await query('SELECT COUNT(*) as totalComments FROM comments');
    const [userCount] = await query('SELECT COUNT(*) as totalUsers FROM users');

    const [recentBlogs] = await query(`
      SELECT b.*, u.name as authorName
      FROM blogs b
      JOIN users u ON b.authorId = u.id
      ORDER BY b.createdAt DESC
      LIMIT 6
    `);

    const [recentComments] = await query(`
      SELECT c.*, b.title as blogTitle, u.name as userName
      FROM comments c
      JOIN blogs b ON c.blogId = b.id
      JOIN users u ON c.userId = u.id
      ORDER BY c.createdAt DESC
      LIMIT 6
    `);

    res.json({
      stats: {
        totalBlogs: Number(blogCounts[0].totalBlogs) || 0,
        publishedBlogs: Number(blogCounts[0].publishedBlogs) || 0,
        draftBlogs: Number(blogCounts[0].draftBlogs) || 0,
        totalViews: Number(blogCounts[0].totalViews) || 0,
        totalLikes: Number(blogCounts[0].totalLikes) || 0,
        totalComments: Number(commentCount[0].totalComments) || 0,
        totalUsers: Number(userCount[0].totalUsers) || 0
      },
      recentBlogs: recentBlogs.map(r => ({ ...formatItem(r), author: { name: r.authorName } })),
      recentComments: recentComments.map(r => ({
        ...formatItem(r),
        blog: { id: r.blogId, title: r.blogTitle },
        user: { name: r.userName }
      }))
    });
  } catch (err) {
    console.error('Admin dashboard error:', err);
    res.status(500).json({ error: 'Error compiling dashboard statistics: ' + err.message });
  }
});

app.get('/api/admin/analytics', adminOnly, async (req, res) => {
  try {
    const period = req.query.period || '30d';
    let days = 30;
    if (period === '7d') days = 7;
    if (period === '90d') days = 90;
    if (period === 'all') days = 365;

    // Daily views aggregation
    const [viewsData] = await query(`
      SELECT DATE_FORMAT(viewedAt, '%Y-%m-%d') as date, COUNT(*) as views
      FROM views
      WHERE viewedAt >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY DATE_FORMAT(viewedAt, '%Y-%m-%d')
      ORDER BY date ASC
    `, [days]);

    // Daily comments aggregation
    const [commentsData] = await query(`
      SELECT DATE_FORMAT(createdAt, '%Y-%m-%d') as date, COUNT(*) as comments
      FROM comments
      WHERE createdAt >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY DATE_FORMAT(createdAt, '%Y-%m-%d')
      ORDER BY date ASC
    `, [days]);

    // Daily likes aggregation
    const [likesData] = await query(`
      SELECT DATE_FORMAT(createdAt, '%Y-%m-%d') as date, COUNT(*) as likes
      FROM likes
      WHERE createdAt >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY DATE_FORMAT(createdAt, '%Y-%m-%d')
      ORDER BY date ASC
    `, [days]);

    // Popular Blogs
    const [popularBlogs] = await query(`
      SELECT b.id, b.title, b.category, b.views, b.likes, u.name as authorName
      FROM blogs b
      JOIN users u ON b.authorId = u.id
      ORDER BY b.views DESC
      LIMIT 8
    `);

    // Category distribution
    const [categoryBreakdown] = await query(`
      SELECT category, COUNT(*) as count, SUM(views) as totalViews
      FROM blogs
      GROUP BY category
      ORDER BY count DESC
    `);

    res.json({
      viewsData: viewsData.map(r => ({ date: r.date, views: Number(r.views) })),
      engagementData: commentsData.map(c => {
        const matchingLike = likesData.find(l => l.date === c.date);
        return {
          date: c.date,
          comments: Number(c.comments),
          likes: matchingLike ? Number(matchingLike.likes) : 0
        };
      }),
      popularBlogs: popularBlogs.map(r => ({ ...formatItem(r), author: { name: r.authorName } })),
      categoryBreakdown: categoryBreakdown.map(r => ({
        category: r.category,
        count: Number(r.count),
        totalViews: Number(r.totalViews) || 0
      }))
    });
  } catch (err) {
    console.error('Analytics compilation error:', err);
    res.status(500).json({ error: 'Error generating analytics.' });
  }
});

// Admin Blog Management
app.get('/api/admin/blogs', adminOnly, async (req, res) => {
  try {
    const [rows] = await query(`
      SELECT b.*, u.name as authorName, u.email as authorEmail
      FROM blogs b
      JOIN users u ON b.authorId = u.id
      ORDER BY b.createdAt DESC
    `);

    res.json(rows.map(r => ({
      ...formatItem(r),
      author: { id: r.authorId, _id: r.authorId, name: r.authorName, email: r.authorEmail }
    })));
  } catch (err) {
    res.status(500).json({ error: 'Error fetching admin blogs.' });
  }
});

app.put('/api/admin/blogs/:id/status', adminOnly, async (req, res) => {
  try {
    const blogId = Number(req.params.id);
    const { status, featured } = req.body;

    if (status !== undefined) {
      await query('UPDATE blogs SET status = ? WHERE id = ?', [status, blogId]);
    }
    if (featured !== undefined) {
      await query('UPDATE blogs SET featured = ? WHERE id = ?', [featured ? 1 : 0, blogId]);
    }

    const [rows] = await query('SELECT * FROM blogs WHERE id = ?', [blogId]);
    res.json(formatItem(rows[0]));
  } catch (err) {
    res.status(400).json({ error: 'Error updating blog status.' });
  }
});

// Admin User Management
app.get('/api/admin/users', adminOnly, async (req, res) => {
  try {
    const [rows] = await query(`
      SELECT u.id, u.name, u.email, u.role, u.status, u.createdAt,
             COUNT(b.id) as articleCount
      FROM users u
      LEFT JOIN blogs b ON b.authorId = u.id
      GROUP BY u.id
      ORDER BY u.createdAt DESC
    `);

    res.json(rows.map(r => ({ ...formatItem(r), articleCount: Number(r.articleCount) || 0 })));
  } catch (err) {
    res.status(500).json({ error: 'Error fetching users.' });
  }
});

app.put('/api/admin/users/:id/status', adminOnly, async (req, res) => {
  try {
    const targetUserId = Number(req.params.id);
    const { status, role } = req.body;

    if (targetUserId === req.user.id && (status === 'blocked' || role === 'user')) {
      return res.status(400).json({ error: 'Cannot demote or block your own active administrative session.' });
    }

    if (status !== undefined) {
      await query('UPDATE users SET status = ? WHERE id = ?', [status, targetUserId]);
    }
    if (role !== undefined) {
      await query('UPDATE users SET role = ? WHERE id = ?', [role, targetUserId]);
    }

    const [rows] = await query('SELECT id, name, email, role, status FROM users WHERE id = ?', [targetUserId]);
    res.json(formatItem(rows[0]));
  } catch (err) {
    res.status(400).json({ error: 'Error updating user settings.' });
  }
});

// Admin Comments Moderation
app.get('/api/admin/comments', adminOnly, async (req, res) => {
  try {
    const [rows] = await query(`
      SELECT c.*, b.title as blogTitle, u.name as userName, u.email as userEmail
      FROM comments c
      JOIN blogs b ON c.blogId = b.id
      JOIN users u ON c.userId = u.id
      ORDER BY c.createdAt DESC
    `);

    res.json(rows.map(r => ({
      ...formatItem(r),
      blog: { id: r.blogId, title: r.blogTitle },
      user: { id: r.userId, name: r.userName, email: r.userEmail }
    })));
  } catch (err) {
    res.status(500).json({ error: 'Error fetching comments for moderation.' });
  }
});

app.put('/api/admin/comments/:id/moderate', adminOnly, async (req, res) => {
  try {
    const commentId = Number(req.params.id);
    const { status } = req.body;
    if (!['approved', 'pending', 'hidden'].includes(status)) {
      return res.status(400).json({ error: 'Invalid moderation state.' });
    }

    await query('UPDATE comments SET status = ? WHERE id = ?', [status, commentId]);
    const [rows] = await query('SELECT * FROM comments WHERE id = ?', [commentId]);
    res.json(formatItem(rows[0]));
  } catch (err) {
    res.status(400).json({ error: 'Error moderating comment.' });
  }
});

// Admin Categories CRUD
app.get('/api/admin/categories', async (req, res) => {
  try {
    const [rows] = await query(`
      SELECT c.*, COUNT(b.id) as blogCount
      FROM categories c
      LEFT JOIN blogs b ON LOWER(b.category) = LOWER(c.name)
      GROUP BY c.id
      ORDER BY c.name ASC
    `);

    res.json(rows.map(r => ({ ...formatItem(r), blogCount: Number(r.blogCount) || 0 })));
  } catch (err) {
    res.status(500).json({ error: 'Error retrieving categories.' });
  }
});

app.post('/api/admin/categories', adminOnly, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Category title is required.' });
    }

    const trimmedName = name.trim();
    const slug = trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const [existing] = await query('SELECT id FROM categories WHERE slug = ? OR name = ?', [slug, trimmedName]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Category with this name or slug already exists.' });
    }

    const [result] = await query(
      'INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)',
      [trimmedName, slug, (description || '').trim()]
    );

    const [created] = await query('SELECT * FROM categories WHERE id = ?', [result.insertId]);
    res.status(201).json(formatItem(created[0]));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/admin/categories/:id', adminOnly, async (req, res) => {
  try {
    const catId = Number(req.params.id);
    const { name, description } = req.body;

    const [rows] = await query('SELECT * FROM categories WHERE id = ?', [catId]);
    if (rows.length === 0) return res.status(404).json({ error: 'Category not found.' });

    let updatedName = rows[0].name;
    let updatedSlug = rows[0].slug;
    let updatedDesc = description !== undefined ? description.trim() : rows[0].description;

    if (name && name.trim()) {
      updatedName = name.trim();
      updatedSlug = updatedName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    await query(
      'UPDATE categories SET name = ?, slug = ?, description = ? WHERE id = ?',
      [updatedName, updatedSlug, updatedDesc, catId]
    );

    const [updated] = await query('SELECT * FROM categories WHERE id = ?', [catId]);
    res.json(formatItem(updated[0]));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/admin/categories/:id', adminOnly, async (req, res) => {
  try {
    const catId = Number(req.params.id);
    await query('DELETE FROM categories WHERE id = ?', [catId]);
    res.json({ message: 'Category deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting category.' });
  }
});

// ==================== CONTACT & NEWSLETTER APIS ====================

app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required.' });
    }

    const [result] = await query(`
      INSERT INTO contacts (name, email, subject, message)
      VALUES (?, ?, ?, ?)
    `, [name.trim(), email.trim(), (subject || '').trim(), message.trim()]);

    res.status(201).json({ message: 'Message recorded successfully in journal archives.', id: result.insertId });
  } catch (err) {
    console.error('Contact error:', err);
    res.status(400).json({ error: 'Error dispatching message.' });
  }
});

app.post('/api/newsletter/subscribe', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required.' });

    const cleanEmail = email.trim().toLowerCase();
    await query('INSERT INTO newsletters (email) VALUES (?)', [cleanEmail]);
    res.status(201).json({ message: 'Enrolled in Sunday Edition weekly dispatch.' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Email already enrolled.' });
    }
    res.status(400).json({ error: 'Error subscribing.' });
  }
});

// ==================== START SERVER ====================
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} with MySQL`);
});
