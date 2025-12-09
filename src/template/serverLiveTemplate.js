/**
 * sendServerLiveTemplate
 * @param {Response} res - Express response object

 */
exports.serverLiveTemplate = (res) => {
  res.send(`
    <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Server Live</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-black flex items-center justify-center h-screen overflow-hidden">

  <div class="text-center">
    <!-- Animated server live message -->
    <h1 class="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 animate-pulse">
      Server is live<span class="inline-block animate-bounce"> 🎉</span>
    </h1>

    <!-- Subtitle -->
    <p class="mt-6 text-xl md:text-2xl text-gray-200">
      Your server is running smoothly!
    </p>

    <!-- Spinning circle animation -->
    <div class="mt-10 flex justify-center">
      <div class="w-6 h-6 md:w-8 md:h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
    </div>
  </div>

</body>
</html>

  `);
};
