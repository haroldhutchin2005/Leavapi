const express = require('express');
const { WelcomeLeave } = require('canvafy');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 4809;

app.get('/leave', async (req, res) => {
  const { name, id, background, count } = req.query;

  // Check for missing parameters
  if (!name || !id || !background || !count) {
    return res.status(400).send('Missing parameters. Please provide name, id, background, and count.');
  }

  // Get the profile picture of the user based on id
  const avatarUrl = await getProfilePictureUrl(id);

  const welcome = await new WelcomeLeave()
    .setAvatar(avatarUrl)
    .setBackground("image", background)
    .setTitle(`Goodbye, ${name}!`)
    .setDescription(`Left members ${count} of this group`)
    .build();

  // Send the generated welcome image as an inline image
  res.set('Content-Type', 'image/png');
  res.set('Content-Disposition', 'inline');
  res.send(Buffer.from(welcome, 'binary'));
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
