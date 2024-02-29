const express = require('express');
const { WelcomeLeave } = require('canvafy');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const port = process.env.PORT || 5000;
const filesDirectory = './'; // Change this to your desired directory

app.get('/join2', async (req, res) => {
  const { name, id, background, count, text } = req.query;

  // Check for missing parameters
  if (!name || !id || !background || !count || !text) {
    return res.status(400).send('Missing parameters. Please provide name, id, background, count, and text.');
  }

  // Get the profile picture of the user based on id
  const avatarUrl = await getProfilePictureUrl(id);

  const welcome = await new WelcomeLeave()
    .setAvatar(avatarUrl)
    .setBackground("image", background)
    .setTitle(`Welcome, ${name}!`)
    .setDescription(`${text}. You are member ${count}.`)
    .build();

  // Save the generated welcome image
  const welcomeImagePath = path.join(__dirname, filesDirectory, 'welcome.jpg');
  await fs.writeFile(welcomeImagePath, welcome);

  // Save the user's profile picture
  const avatarImagePath = path.join(__dirname, filesDirectory, 'avatar.jpg');
  const avatarImage = await axios.get(avatarUrl, { responseType: 'arraybuffer' });
  await fs.writeFile(avatarImagePath, Buffer.from(avatarImage.data, 'binary'));

  // Send the generated welcome image as an attachment
  res.set('Content-Type', 'image/png');
  res.set('Content-Disposition', `attachment; filename=welcome-${id}.png`);
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
