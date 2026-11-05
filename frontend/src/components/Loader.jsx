const Loader = () => {
  return (
    <div className="flex flex-col items-center justify-center py-32 space-y-4">
      <div className="w-8 h-8 border-2 border-[#121212] border-t-transparent rounded-full animate-spin"></div>
      <span className="font-serif italic text-sm text-[#7A7A7A] tracking-wider">
        Preparing The Journal dispatch...
      </span>
    </div>
  );
};

export default Loader;
