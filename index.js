const express = require('express');
const { WelcomeLeave } = require('canvafy');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const port = process.env.PORT || 4000;
const filesDirectory = './'; // Change this to your desired directory

app.get('/join2', async (req, res) => {
  const { memberId, backgroundUrl, title, description } = req.query;

  // Get the profile picture of the user based on event.senderID
  const avatarUrl = await getProfilePictureUrl(event.senderID);

  const welcome = await new WelcomeLeave()
    .setAvatar(avatarUrl)
    .setBackground("image", backgroundUrl)
    .setTitle(title)
    .setDescription(description)
    .build(); // No need to set overlayOpacity, using the default value

  // Save the generated welcome image
  const welcomeImagePath = path.join(__dirname, filesDirectory, 'welcome.jpg');
  await fs.writeFile(welcomeImagePath, welcome);

  // Save the user's profile picture
  const avatarImagePath = path.join(__dirname, filesDirectory, 'avatar.jpg');
  const avatarImage = await axios.get(avatarUrl, { responseType: 'arraybuffer' });
  await fs.writeFile(avatarImagePath, Buffer.from(avatarImage.data, 'binary'));

  // Send the generated welcome image as an attachment
  res.set('Content-Type', 'image/png');
  res.set('Content-Disposition', `attachment; filename=welcome-${memberId}.png`);
  res.send(welcome);
});

async function getProfilePictureUrl(senderID) {
  try {
    const response = await axios.get(
      `https://graph.facebook.com/${senderID}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
      { responseType: 'arraybuffer' }
    );

    return `data:image/png;base64,${Buffer.from(response.data, 'binary').toString('base64')}`;
  } catch (error) {
    console.error('Error fetching profile picture:', error.message);
    return null;
  }
}

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
