
const express = require('express');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config()
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const stripe = require('stripe')('sk_test_51PmzZqJkRJC7ws0wCBwhfucHRRtCpWmexsOHOxJJtjjPyJLRoY8TN3e6ElgfhWzowtcVZuZ1m3SFupy7tTcmjoKy00bUCYq1Oq');

// middleware
app.use(cors());
app.use(express.json());


// ACCESS_TOKEN_SECRET
const ACCESS_TOKEN_SECRET = '10d9b111e076fa91946fc301bc501e17cd0f997d87994a43d637dd8137575a64d32a59bc68931c821aab1c211987a887d6ceaac3e754752e693366198b8a12e8'


const uri = "mongodb+srv://saadealif2010:cwOR53JqLDEZSRcK@cluster0.jn1qntd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
// const uri = `mongodb+srv://saadealif2010:Xyar9GR79vKsGjB@cluster0.swu9d.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const scholarshipCollection = client.db("scholarshipsDb").collection('scholarships');
    const applicantCollection = client.db("scholarshipsDb").collection('applicants');
    const reviewCollection = client.db("scholarshipsDb").collection('reviews');
    const userCollection = client.db("scholarshipsDb").collection('users');
    const paymentCollection = client.db("scholarshipsDb").collection('payments');

    app.post('/users', async (req, res) => {
      const user = req.body;

      // Fetch all users from the collection
      const allUsers = await userCollection.find().toArray();

      // Iterate over the fetched users to check for an existing email
      for (let i = 0; i < allUsers.length; i++) {
        if (allUsers[i].email === user.email) {
          return res.send({ message: 'User already exists!' });
        }
      }

      // If no existing user is found, insert the new user
      const result = await userCollection.insertOne(user);

      // Send the result of the insertion back to the client
      res.send(result);
    });



    app.get('/users', async (rea, res) => {
      const users = await userCollection.find().toArray();
      res.send(users);
    })
    app.get('/hello', (req, res) => {
      res.send('hello guys')
    })



    app.post('/scholarships', async (req, res) => {
      const scholarship = req.body;
      const result = await scholarshipCollection.insertOne(scholarship);

      res.send(result);
    })

    app.get('/scholarships', async (req, res) => {
      const result = await scholarshipCollection.find().toArray();
      res.send(result);
    })
    app.delete('/scholarships/:id', async (req, res) => {
      const id = req.params.id;
      
      const filter = { _id: new ObjectId(id) }; // ###### PITFALL ZONE--- OBJECT ID DILLEMA  ########

      const result = await scholarshipCollection.deleteOne(filter);
      res.send(result);
    })

        
    app.get('/scholarships/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: id }; //as it doesnt have objectId as i copy-pasted json in Atlas
        // const query = { _id: new ObjectId(id) };
        const result = await scholarshipCollection.findOne(query);

        if (result) {
          res.send(result);
        } else {
          res.status(404).send({ message: 'Scholarship not found' });
        }
      } catch (error) {
        console.error('Error fetching scholarship:', error);
        res.status(500).send({ message: 'Internal Server Error' });
      }
    });

    app.patch('/scholarships/:id' , async(req,res) =>{
      const id = req.params.id;
      const scholarship = req.body;
      const options = {upsert :true};
      const filter = {_id : new ObjectId(id)};

      const updatedScholarship = {
        $set: {
          scholarshipName: scholarship.scholarshipName,
          university: scholarship.university,
          deadline: scholarship.deadline,
          postDate: scholarship.postDate,
          subjectCategory: scholarship.subjectCategory,
          scholarshipCategory: scholarship.scholarshipCategory,
          degreeCategory: scholarship.degreeCategory,
          country: scholarship.country,
          city: scholarship.city,
          worldRank: scholarship.worldRank,
          tuitionFees: scholarship.tuitionFees,
          applicationFees: scholarship.applicationFees,
          serviceCharges: scholarship.serviceCharges,
          postedEmail: scholarship.postedEmail,
          postedName: scholarship.postedName,
          universityPhoto: scholarship.universityPhoto,
          universityLogo: scholarship.universityLogo,
        }
      };
    
      try {
        const result = await scholarshipCollection.updateOne(filter, updatedScholarship, options);
        res.send(result);
      } catch (error) {
        console.error('Error updating scholarship:', error);
        res.status(500).send({ message: 'Failed to update scholarship', error });
      }
    })


    app.post('/reviews', async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);

      res.send(result);
    })

    app.patch('/reviews/:id', async (req, res) => {
      const id = req.params.id;
      const review = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedReview = {
        $set: {
          rating: review?.rating,
          comments: review?.comments,
          currentDate: review?.currentDate,
        }
      }
      console.log(updatedReview);
      const result = await reviewCollection.updateOne(filter, updatedReview, options);
      res.send(result);
    })

    app.delete('/reviews/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };

      const result = await reviewCollection.deleteOne(filter);
      res.send(result);
    });

    app.get('/reviews', async (req, res) => {
      const result = await reviewCollection.find().toArray();
      res.send(result);
    })




    app.get('/applicants', async (req, res) => {
      const result = await applicantCollection.find().toArray();
      res.send(result);
    })
    app.get('/applicants/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };

      const result = await applicantCollection.findOne(filter);
      res.send(result);
    })

    app.post('/applicants', async (req, res) => {
      const applicant = req.body;
      const result = await applicantCollection.insertOne(applicant);

      res.send(result);
    })


    app.patch('/applicants/:id', async (req, res) => {
      const id = req.params.id;
      const applicant = req.body;
      const options = { upsert: true };
      const filter = { _id: new ObjectId(id) };
      const updatedApplicant = {
        $set: {
          telephone: applicant.telephone,
          university: applicant.university,
          scholarshipCategory: applicant.scholarshipCategory,
          subjectCategory: applicant.subjectCategory,
          gender: applicant.gender,
          studyGap: applicant.studyGap,
          degreeCategory: applicant.degreeCategory,
          country: applicant.country,
          district: applicant.district,
          village: applicant.village,
          hscResult: applicant.hscResult,
          sscResult: applicant.sscResult,
          image: applicant.image,
          userName: applicant.userName,
          email: applicant.email,
          currentDate: applicant.currentDate,
          scholarshipId: applicant.scholarshipId,
          city: applicant.city,
          feedback: applicant.feedback,
          applicationFees: applicant.applicationFees,
          serviceCharge: applicant.serviceCharge,
          applicationStatus: applicant.applicationStatus,
        }
      };

      app.delete('/applicants/:id', async (req, res) => {
        const id = req.params.id;
        console.log('Received ID:', id);  // Log the ID
        const filter = { _id: new ObjectId(id) };

        try {
          const result = await applicantCollection.deleteOne(filter);
          if (result.deletedCount === 0) {
            console.log('Applicant not found');  // Log if no applicant is found
            return res.status(404).send({ message: 'Applicant not found' });
          }
          res.send(result);
        } catch (error) {
          console.log('Error:', error);  // Log any errors
          res.status(500).send({ message: 'Error deleting applicant', error });
        }
      });
      try {
        const result = await applicantCollection.updateOne(filter, updatedApplicant, options);
        res.send(result);
      } catch (error) {
        res.status(500).send({ message: 'Error updating applicant', error });
      }
    });





    app.post('/create-payment-intent', async (req, res) => {
      const { price } = req.body;
      if (parseInt(price) <= 0) {
        return
      }
      const amount = parseInt(price * 100);
      console.log(amount, 'amount inside the intent')

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: 'usd',
        payment_method_types: ['card']
      });

      res.send({
        clientSecret: paymentIntent.client_secret
      })
    });

    app.post('/payments', async (req, res) => {
      const payment = req.body;
      const result = await paymentCollection.insertOne(payment);

      res.send(result);
    })
    app.get('/payments', async (req, res) => {
      const payments = await paymentCollection.find().toArray();
      res.send(payments);
    })


    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Assignment-12 server is running')
})

app.listen(port, () => {
  console.log(`teacher is monitoring student id--> ${port}`);
})
