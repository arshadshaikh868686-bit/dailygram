const Groq = require('groq-sdk');

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});


exports.generateTimetable = async (req, res) => {
    try {
        const { syllabus, days } = req.body;

        if (!syllabus || !String(syllabus).trim()) {
            return res.status(400).json({ message: 'syllabus is required' });
        }

        const numberOfDays = Number(days);
        if (!Number.isInteger(numberOfDays) || numberOfDays < 1 || numberOfDays > 365) {
            return res.status(400).json({ message: 'days must be an integer between 1 and 365' });
        }

        const systemInstruction = `You are Safi, a helpful study planning AI. 
Return ONLY valid JSON matching this schema: {"days": [{"day": 1, "topics": ["Topic"], "notes": "Guidance"}]}. 
Do not add markdown formatting, backticks, or explanations outside the JSON.`;

        const prompt = `Syllabus/Topics:\n${String(syllabus).trim()}\n\nAvailable Days: ${numberOfDays}. Create a practical day-wise study timetable.`;

        const response = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: systemInstruction },
                { role: 'user', content: prompt }
            ],
            model: 'openai/gpt-oss-120b',
            response_format: { type: "json_object" },
            include_reasoning: false 
        });

        const text = response.choices[0].message.content.trim();
        const timetable = JSON.parse(text);

        return res.status(200).json(timetable);
    } catch (error) {
        console.error('Groq timetable error:', error);
        return res.status(502).json({ message: 'Unable to generate timetable' });
    }
};


exports.chat = async (req, res) => {
    try {
        const { message, history } = req.body;

        if (!message || !String(message).trim()) {
            return res.status(400).json({ message: 'message is required' });
        }

        const systemInstruction = `You are Safi, a friendly AI assistant inside the Dailygram application.
Your job is to have natural conversations. Help with: casual talk, study, programming, writing, productivity.
Rules: Do NOT force every conversation into studying. Answer casually if greeted. Keep answers concise unless asked for detail. Do not repeatedly introduce yourself.`;

        let formattedMessages = [{ role: 'system', content: systemInstruction }];

        if (Array.isArray(history)) {
            history.forEach(turn => {
                if (turn.role === 'assistant' && formattedMessages.length === 1) return;
                
                formattedMessages.push({
                    role: turn.role === 'assistant' ? 'assistant' : 'user',
                    content: turn.text || turn.message || ""
                });
            });
        }

        formattedMessages.push({ role: 'user', content: String(message).trim() });

        const response = await groq.chat.completions.create({
            messages: formattedMessages,
            model: 'openai/gpt-oss-20b',
            include_reasoning: false 
        });

        
        const reply = response.choices[0].message.content.trim();

        return res.status(200).json({ reply });
    } catch (error) {
        console.error('Groq chat error:', error);
        return res.status(502).json({ message: 'Unable to generate AI response' });
    }
};
