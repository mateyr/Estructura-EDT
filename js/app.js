import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDV33BPjEsSROyRgxwTZfhst6WgXMmoCTw",
  authDomain: "administracion-proyectos-6db7c.firebaseapp.com",
  projectId: "administracion-proyectos-6db7c",
  storageBucket: "administracion-proyectos-6db7c.appspot.com",
  messagingSenderId: "965738647785",
  appId: "1:965738647785:web:804ad7f8d149fa8a65e078",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Annotorious initialization
const anno = Annotorious.init({
  image: "estructura_edt", // image element or ID
});

const querySnapshot = await getDocs(collection(db, "comments"));
const annotations = querySnapshot.docs.map((doc) => {
  const data = doc.data();
  return {
    "@context": "http://www.w3.org/ns/anno.jsonld",
    type: "Annotation",
    body: [
      {
        type: "TextualBody",
        value: data.comment,
        purpose: "commenting",
      },
      ...data.tags.map((tag) => ({
        type: "TextualBody",
        value: tag,
        purpose: "tagging",
      })),
    ],
    target: {
      source: "/public/assets/ETD.drawio.svg",
      selector: {
        type: "FragmentSelector",
        conformsTo: "http://www.w3.org/TR/media-frags/",
        value: data.position,
      },
    },
    id: doc.id,
  };
});

// Load Annotations
anno.setAnnotations(annotations);

// Add event handlers using .on
anno.on("createAnnotation", async function (annotation) {
  try {
    const comment = annotation.body.find(
      (body) => body.purpose === "commenting"
    ).value;
    const tags = annotation.body
      .filter((body) => body.purpose === "tagging")
      .map((body) => body.value);
    const position = annotation.target.selector.value;

    await setDoc(doc(db, "comments", annotation.id), {
      comment: comment,
      tags: tags,
      position: position,
      createdAt: serverTimestamp(),
    });
  } catch (e) {
    console.error("Error adding comment: ", e);
  }
});
