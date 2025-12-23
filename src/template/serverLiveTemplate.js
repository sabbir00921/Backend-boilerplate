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

exports.forgetPassword = (name, otp) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Password Reset OTP</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f4f4; font-family:Arial, Helvetica, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4; padding:20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0"
          style="max-width:500px; background-color:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 4px 10px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background-color:#F26C15; padding:20px; text-align:center;">
              <h1 style="margin:0; color:#ffffff; font-size:24px;">
                Password Reset
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:30px; text-align:center;">
              <p style="font-size:16px; color:#333333; margin-bottom:10px;">
                Hello <strong>${name}</strong>,
              </p>

              <p style="font-size:15px; color:#555555; margin-bottom:20px;">
                You requested to reset your password. Use the OTP below to proceed.
              </p>

              <!-- OTP Box -->
              <div style="
                display:inline-block;
                padding:15px 30px;
                font-size:28px;
                letter-spacing:6px;
                font-weight:bold;
                color:#F26C15;
                border:2px dashed #F26C15;
                border-radius:6px;
                margin:20px 0;
              ">
                ${otp}
              </div>

              <p style="font-size:14px; color:#777777; margin-top:20px;">
                This OTP is valid for <strong>10 minutes</strong>.
              </p>

              <p style="font-size:14px; color:#777777;">
                If you didn’t request this, please ignore this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#fafafa; padding:15px; text-align:center;">
              <p style="font-size:12px; color:#999999; margin:0;">
                © 2025 Your Company. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
};
