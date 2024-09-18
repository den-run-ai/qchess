const { Configuration, OpenAIApi } = require('openai');

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export default async (req, res) => {
  if (req.method === 'POST') {
    const { moves } = req.body;

    try {
      const completion = await openai.createChatCompletion({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are a chess grandmaster' },
          { role: 'user', content: `Evaluate the following chess moves: ${moves}` },
        ],
      });

      const response = completion.data.choices[0].message.content;
      const scores = response
        .split('\n')
        .filter(line => line.includes('eval'))
        .map(line => line.trim());

      res.status(200).json({ scores });
    } catch (error) {
      console.error('OpenAI API Error:', error.message);
      res.status(500).json({ error: 'Failed to evaluate the game' });
    }
  } else {
    res.status(405).json({ message: 'Only POST requests are allowed' });
  }
};
