import  express  from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';
import {Configuration,OpenAIApi } from 'openai';

dotenv.config();

// console.log(process.env,O)
const configuration=new Configuration({
    apiKey:process.env.OPENAI_API_KEY,

});


const openai=new OpenAIApi(configuration);
const app=express();
app.use(cors());
app.use(express.json());
const rateLimit = (req, res, next) => {
    // Set your desired rate limit values
    const limit = 5; // Number of requests allowed
    const interval = 60 * 1000; // Time interval in milliseconds (e.g., 60 seconds)
  
    // Unique identifier for the client making the request
    const clientId = req.ip; // You may use a more robust method for identifying clients
  
    // Initialize or retrieve the token bucket for the client
    if (!req.rateLimit) {
      req.rateLimit = {
        tokens: limit,
        lastRefresh: Date.now(),
      };
    }
  
    // Calculate the elapsed time since the last refresh
    const elapsedTime = Date.now() - req.rateLimit.lastRefresh;
  
    // Refresh the token bucket based on the time elapsed
    req.rateLimit.tokens += (elapsedTime / interval) * limit;
    req.rateLimit.tokens = Math.min(req.rateLimit.tokens, limit);
  
    // Check if there are enough tokens for the current request
    if (req.rateLimit.tokens >= 1) {
      // Consume one token and proceed with the request
      req.rateLimit.tokens -= 1;
      req.rateLimit.lastRefresh = Date.now();
      next();
    } else {
      // Send a 429 response if the rate limit is exceeded
      res.status(429).json({ error: 'Rate limit exceeded. Try again later.' });
    }
  };
  
app.get('/',async(req,res)=>{
    res.status(200).send({
        message :'Hello from Codex',
    })
});

app.post('/',async (req, res)=>{
    try{
        const prompt=req.body.prompt;

        const response=await openai.createCompletion({
            model: "text-davinci-002",
            prompt: `${prompt}`,
            temperature: 0.99,
            max_tokens: 256,
            top_p: 1,
            frequency_penalty: 0.5,
            presence_penalty: 0,
})
res.status(200).send({
    bot:response.data.choices[0].text
})
}catch(error){
    console.log(error);
    res.status(500).send({error})
}
}
);    

app.listen(5000,()=>console.log("server is running on port http://localhost:5000"));