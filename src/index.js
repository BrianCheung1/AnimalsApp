import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import Axios from "axios";
import CreateNewForm from "./components/CreateNewForm";
import AnimalCard from "./components/AnimalCard";

function App() {
  //variable then function that lets us update the variable
  const [animals, setAnimals] = useState([]);

  //Second parameter is what react watches for before making changes to the site
  //empty parameter means it will only run it once
  useEffect(() => {
    async function go(){
        const response = await Axios.get("/api/animals")
        setAnimals(response.data)
    }
    go()
  }, []);

  return (
    <div className="container">
      <p><a href="/">&laquo; Back to public homepage</a></p>
      <CreateNewForm setAnimals={setAnimals}/>
      <div className="animal-grid">
      {animals.map(function (animal) {
        return <AnimalCard key={animal._id} name={animal.name} species={animal.species} photo={animal.photo} id={animal._id} setAnimals={setAnimals}/>;
      })}
      </div>
    </div>
  );
}


const root = createRoot(document.querySelector("#app"));
root.render(<App />);
