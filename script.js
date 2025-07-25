// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getDatabase, ref, set, get }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
  apiKey: "AIzaSyADGPOv1l2tKfuXFbIoaice2XrcsP3NQ7I",
  authDomain: "birthday-app-94b44.firebaseapp.com",
  databaseURL: "https://birthday-app-94b44-default-rtdb.firebaseio.com/",
  projectId: "birthday-app-94b44",
  storageBucket: "birthday-app-94b44.firebasestorage.app",
  messagingSenderId: "1061614544038",
  appId: "1:1061614544038:web:5746fc98e7c8b2f2364067",
  measurementId: "G-QTZD5ZZ77H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

//To handle the SignUp, create the users and then store their name and birthday
const signupForm = document.getElementById('signup-form');
signupForm.addEventListener('submit', (e) => {
    e.preventDefault();

  const name = document.getElementById('name').value;
  const birthdate = document.getElementById('birthdate').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      // Store name and birthdate in Realtime Database
      set(ref(db, 'users/' + user.uid), {
        name: name,
        birthdate: birthdate,
        email: email
      });
      alert('User created successfully!');
      signupForm.reset();
    })
    .catch((error) => {
      alert(error.message);
    });
})


//const loginForm = document.getElementById('Login-form');
//loginForm.addEventListener('submit')





const loginForm = document.getElementById('Login-form');

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      alert('Login successful!');
      loginForm.reset();
      // Here we will check birthday later
    })
    .catch((error) => {
      alert(error.message);
    });
});


/*Now After successful login, we need to get the logged-in user's uid.
- Fetch user data (name and birthdate) from Realtime Database by using get(ref(db, 'users/' + uid)).
- Calculate the number of days until birthday using a simple function.
- Fetch a random quote from https://type.fit/api/quotes.
- Display either:
           A happy birthday message (if today is the birthday).
           Or "X days left until your birthday".*/

//to handle the message and the logout button
const messageDisplay = document.getElementById('message');
const logoutBtn = document.getElementById('logout-btn');

// I calculate the days until the user's next birthday
function daysUntilBirthday(birthdateStr) {
  const today = new Date();
  today.setHours(0,0,0,0);

  const parts = birthdateStr.split('-');
  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);

  let nextBirthday = new Date(today.getFullYear(), month - 1, day);
  nextBirthday.setHours(0,0,0,0);

  if (nextBirthday < today) {
    nextBirthday.setFullYear(today.getFullYear() + 1);
  }
 // use const ONE DAY to calculate the number of millisecond in one day
  const ONE_DAY = 1000 * 60 * 60 * 24;
  const daysremaining = Math.ceil((nextBirthday - today) / ONE_DAY);
  return daysremaining; // 0 if today is birthday
}

// Function to fetch a random quote
async function getRandomQuote() {
  try {
    const res = await fetch('https://zenquotes.io/api/random');
    const quotes = await res.json();
    const random = quotes[Math.floor(Math.random() * quotes.length)];
    return random?.text || "Have a nice day!";
  } catch {
    return "Have an nice day!";
  }
}

// LOGIN - Add birthday check
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Get user data from Realtime Database
    const snapshot = await get(ref(db, 'users/' + user.uid));
    if (snapshot.exists()) {
      const { name, birthdate } = snapshot.val();
      const daysLeft = daysUntilBirthday(birthdate);

      if (daysLeft === 0) {
        const quote = await getRandomQuote();
        messageDisplay.innerHTML = `<h3>🎉 HAPPY BIRTHDAY, ${name}! 🎉</h3><p>${quote}</p>`;
      } else {
        messageDisplay.innerHTML = `<p>HI ${name}, ${daysLeft} DAYS LEFT UNTIL YOUR BIRTHDAY.</p>`;
      }
      logoutBtn.style.display = 'block';
      signupForm.style.display = 'none';
      loginForm.style.display = 'none';
    } else {
      messageDisplay.innerHTML = `<p style="color:red;">User data not found.</p>`;
    }
    loginForm.reset();
  } catch (error) {
    alert(error.message);
  }
});

// LOGOUT
logoutBtn.addEventListener('click', async () => {
  await signOut(auth);
  messageDisplay.innerHTML = '';
  logoutBtn.style.display = 'none';
  signupForm.style.display = 'block';
  loginForm.style.display = 'block';
  alert('Logged out successfully!');
});