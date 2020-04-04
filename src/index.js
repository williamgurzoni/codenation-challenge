const fetch = require("node-fetch");
const fs = require("fs");
const FormData = require("form-data");
const path = require("path");
const sha1 = require("js-sha1");

const filePath = path.join(__dirname, "answer_origin.json");
const filePathResult = path.join(__dirname, "answer.json");

const alphabet = "abcdefghijklmnopqrstuvwxyz";
const url =
  "https://api.codenation.dev/v1/challenge/dev-ps/submit-solution?token=9e7eda08905232d68629c81b69bd3b8f49549dc4";

function decrypt(shift, phrase) {
  let decrypted = "";

  for (let i = 0; i < phrase.length; i++) {
    const indexInAlphabet = alphabet.indexOf(phrase.substr(i, 1));

    if (indexInAlphabet >= 0) {
      let newIndex = indexInAlphabet - shift;

      if (newIndex < 0) {
        newIndex = alphabet.length + newIndex;
      }

      decrypted += alphabet.substr(newIndex, 1);
    } else {
      decrypted += phrase.substr(i, 1);
    }
  }

  return decrypted;
}

async function sendRequest() {
  try {
    const file = await fs.createReadStream(filePathResult);
    const formData = new FormData();

    formData.append("answer", file);

    fetch(url, {
      method: "POST",
      body: formData,
    })
      .then((data) => {
        console.log(data);
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (error) {
    console.log(error);
  }
}

function readFile() {
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) throw err;

    const obj = JSON.parse(data);

    obj.decifrado = decrypt(obj.numero_casas, obj.cifrado);
    obj.resumo_criptografico = sha1(obj.decifrado);

    fs.writeFile(filePathResult, JSON.stringify(obj), (err) => {
      if (err) throw err;

      sendRequest();
    });
  });
}

readFile();
