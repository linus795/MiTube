// Firebase SDK imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-storage.js";

// TODO: Udskift med dit eget Firebase config objekt
const firebaseConfig = {
  apiKey: "AIzaSyAgi8UYOQagp-Fm7gm2n8ZpE2OAT88jhqI",
  authDomain: "mitube-9c0bf.firebaseapp.com",
  projectId: "mitube-9c0bf",
  storageBucket: "mitube-9c0bf.firebasestorage.app",
  messagingSenderId: "129954986810",
  appId: "1:129954986810:web:ad5498dbac335e2ffaee03",
  measurementId: "G-D9E7V9E6WX"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// Elements
const uploadBtn = document.getElementById("uploadBtn");
const videoFileInput = document.getElementById("videoFile");
const titleInput = document.getElementById("title");
const videosDiv = document.getElementById("videos");

// Upload video
uploadBtn.addEventListener("click", async () => {
  const file = videoFileInput.files[0];
  const title = titleInput.value.trim();

  if (!file || !title) {
    alert("Udfyld titel og vælg en video!");
    return;
  }

  try {
    // Upload til Firebase Storage
    const fileRef = ref(storage, "videos/" + file.name);
    await uploadBytes(fileRef, file);
    const url = await getDownloadURL(fileRef);

    // Gem metadata i Firestore
    await addDoc(collection(db, "videos"), {
      title: title,
      url: url,
      createdAt: new Date()
    });

    alert("Video uploadet!");
    titleInput.value = "";
    videoFileInput.value = "";

    loadVideos(); // Reload listen
  } catch (err) {
    console.error(err);
    alert("Fejl ved upload: " + err.message);
  }
});

// Hent og vis videoer
async function loadVideos() {
  videosDiv.innerHTML = "";
  const querySnapshot = await getDocs(collection(db, "videos"));
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    const videoEl = document.createElement("div");
    videoEl.innerHTML = `
      <h3>${data.title}</h3>
      <video controls src="${data.url}"></video>
    `;
    videosDiv.appendChild(videoEl);
  });
}

// Kør ved start
loadVideos();
