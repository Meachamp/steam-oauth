import express from 'express';
import steamauth from './steamauth.mjs';

var app = express();
app.use(express.json());
app.use(express.static('web'));

app.get('/login', async(req, res) => {
  // Replace these with needed config
  res.redirect(steamauth.generate_redirect('http://localhost:3000', '/auth'))
})

app.get('/auth', async (req, res) => {
  console.log(req.query)
  let valid_struct = await steamauth.verify_id(req.query);

  if(valid_struct.success) {
    console.log(`Validated Oauth, steamid is: ${valid_struct.steamid}`)

    // login/make token here
    res.send({success:true, steamid: valid_struct.steamid})
  } else {
    //Validation of auth flow did not pass
    res.send({success:false, reason: "Invalid auth token."})
  }
});

app.listen(3000);
