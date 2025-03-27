document.addEventListener("DOMContentLoaded", function () {
  const recipeCardsContainer = document.querySelector(
    ".recipe-cards-container"
  );
  const searchText = document.querySelector(".search-text");
  const searchBtn = document.querySelector(".search-button");
  const procedureCard = document.querySelector(".procedure-card");
  recipes = [];
  const lovedRecipesList = document.querySelector(".loved-recipes-list");

  const addIngredientBtn = document.getElementById("addIngredientBtn");
  const ingredientInput = document.getElementById("ingredientInput");
  const ingredientList = document.getElementById("ingredientList");
  const recipeForm = document.getElementById("recipeForm");
  const recipeName = document.getElementById("recipeName");
  const recipeDesc = document.getElementById("recipeDesc");
  const addProcedureBtn = document.getElementById("addProcedureBtn");
  const procedureInput = document.getElementById("procedureInput");
  const procedureList = document.getElementById("procedureList");
  const recipeImage = document.getElementById("recipeImage");
  const recipeOwner = document.getElementById("recipeOwner");

  //function for getting all the recipes using GET method

  function getRecipes() {
    // fetch("http://localhost:3000/recipes") // https://recipe-server-su9a.onrender.com
    fetch("https://recipe-server-su9a.onrender.com/api/recipes")
      .then((res) => res.json())
      .then((data) => {
        recipes = data;
        recipes &&
          recipes.forEach((recipe) => {
            displayCards(recipe);
            console.log(Object.keys(recipe));
          });
        displayMostLovedRecipes();
      })
      .catch((error) => {
        console.error("Error fetching recipes:", error);
        alert("Failed to fetch recipes. Please try again later.");
      });
  }
  //function for displaying the small cards
  function displayCards(recipe) {
    let recipeCard = document.createElement("div");
    recipeCard.classList.add("recipe-card");

    recipeCard.innerHTML = `
            <h3 class="recipe-title">${recipe.name}</h3>
            <img src="${recipe.image}" alt="Recipe Image" class="recipe-image">
            <p class="recipe-description">${recipe.description}</p>
            <p class="recipe-owner">By: ${recipe.owner}</p>
            <div class="recipe-actions">
                
                <button class="love-btn">${recipe.loves || 0}❤️</button>
            </div>
        `;
    recipeCardsContainer.appendChild(recipeCard);

    recipeCard.addEventListener("click", () => {
      mainRecipeCard(recipe);
    });

    const loveButton = recipeCard.querySelector(".love-btn");

    if (loveButton) {
      loveButton.addEventListener("click", (event) => {
        event.stopPropagation();
        event.preventDefault();

        addLoves(recipe, loveButton);
        loveButton.textContent = `${recipe.loves}❤️`;
      });
    }
  }

  //function for displaying most loved recipes
  function displayMostLovedRecipes() {
    lovedRecipesList.innerHTML = "";
    const sortedRecipes = [...recipes].sort(
      (a, b) => (b.loves || 0) - (a.loves || 0)
    );
    sortedRecipes.slice(0, 5).forEach((recipe) => {
      const listItem = document.createElement("li");
      listItem.textContent = recipe.name;
      lovedRecipesList.appendChild(listItem);

      listItem.addEventListener("click", () => {
        document.querySelectorAll(".selected").forEach((item) => {
          item.classList.remove("selected");
        });

        listItem.classList.toggle("selected");
        mainRecipeCard(recipe);
      });
    });
  }

  //a function for adding loves when a person clickes on the love button using PATCH method
  function addLoves(recipe, loveButton) {
    if (!recipe.loves) {
      recipe.loves = 0;
    }
    recipe.loves++;

    fetch(`https://recipe-server-su9a.onrender.com/api/recipes/${recipe.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ loves: recipe.loves }),
    })
      .then((res) => res.json())
      .then((updatedRecipe) => {
        console.log("Loves updated:", updatedRecipe);
        const index = recipes.findIndex((r) => r.id === recipe.id);
        if (index !== -1) {
          recipes[index].loves = updatedRecipe.loves;
        }

        if (loveButton) {
          loveButton.textContent = `${updatedRecipe.loves}❤️`;
        }
        displayMostLovedRecipes();
      })
      .catch((error) => {
        console.error("Error updating loves:", error);
      });

    return recipe.loves;
  }

  //this is the funnction for searching for a recipe
  function search() {
    let searchValue = searchText.value.trim().toLowerCase();
    let matchingRecipes = recipes.filter((recipe) =>
      recipe.name.toLowerCase().includes(searchValue)
    );

    recipeCardsContainer.innerHTML = "";

    if (matchingRecipes.length > 0) {
      matchingRecipes.forEach((recipe) => {
        displayCards(recipe);
      });
      searchText.value = "";
    } else {
      alert("Recipe not found");
    }
  }

  searchBtn.addEventListener("click", () => {
    search();
  });
  //this is the function for the popup once the image is clicked or name on the aside
  function mainRecipeCard(recipe) {
    if (!procedureCard) {
      console.error("procedureCard element not found in the HTML.");
      return;
    }

    const allIngredients = recipe.ingredients
      .map((ingredient) => `<li>${ingredient}</li>`)
      .join("");

    const allInstructions = recipe.instructions
      .map((instruction) => `<li>${instruction}</li>`)
      .join("");

    procedureCard.innerHTML = `
            <h1 class="recipe-name">${recipe.name}</h1>
            <p>${recipe.description}</p>
            <img class="recipe-image" src="${recipe.image}" alt="">
            <h3>Ingredients</h3>
            <ul class="recipe-ingredients">
                ${allIngredients}
            </ul>
            <ol class="recipe-procedures">
                ${allInstructions}
            </ol>
            <button class="close-procedure">Close</button>
        `;
    // Show the overlay
    procedureCard.style.display = "block";
    recipeCardsContainer.classList.add("blurred");

    //close button functionality
    const closeProcedure = document.querySelector(".close-procedure");
    closeProcedure.addEventListener("click", (e) => {
      procedureCard.style.display = "none";
      recipeCardsContainer.classList.remove("blurred");
    });
  }

  //function for adding recipes
  const addBtn = document.querySelector(".add-btn");

  addBtn.addEventListener("click", (e) => {
    formContainer.classList.remove("hidden");
    // e.stopPropagation()
  });
  closeFormBtn.addEventListener("click", () => {
    formContainer.classList.add("hidden");
  });


addIngredientBtn.addEventListener("click", function () {
    const ingredient = ingredientInput.value.trim();
    if (ingredient) {
      const listItem = document.createElement("li");
      
      // Create container for ingredient text
      const ingredientText = document.createElement("span");
      ingredientText.className = "ingredient-text"; 
      ingredientText.textContent = ingredient;
      
      // Create edit button
      const editBtn = document.createElement("button");
      editBtn.textContent = "edit";
      editBtn.classList.add("edit");
      
      // Append elements
      listItem.appendChild(ingredientText);
      listItem.appendChild(editBtn);
      ingredientList.appendChild(listItem);
      
      // Clear input
      ingredientInput.value = "";
  
      // Edit button handler
      editBtn.addEventListener("click", () => {
        // Get only the ingredient text (from the span)
        ingredientInput.value = ingredientText.textContent.trim();
        listItem.remove();
      });
    }
  });

  addProcedureBtn.addEventListener("click", function () {
    const procedure = procedureInput.value.trim();
    if (procedure) {
      const listItem = document.createElement("li");


      // Create container for ingredient text
      const procedureText = document.createElement("span");
      procedureText.className = "ingredient-text"; 
      procedureText.textContent = procedure;
      
      // Create edit button
      const editBtn = document.createElement("button");
      editBtn.textContent = "edit";
      editBtn.classList.add("edit");
      
      // Append elements
      listItem.appendChild(procedureText);
      listItem.appendChild(editBtn);
      procedureList.appendChild(listItem);
      
      // Clear input
      procedureInput.value = "";
  
      // Edit button handler
      editBtn.addEventListener("click", () => {
        // Get only the ingredient text (from the span)
        procedureInput.value =procedureText.textContent.trim();
        listItem.remove();
      });

  
    }
  });
  recipeForm.addEventListener("submit", function (event) {
    event.preventDefault();
    handleFormSubmission();
  });

  recipeForm.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      handleFormSubmission();
    }
  });
  //function for the new recipe submissions using POST method
  function handleFormSubmission() {
    const ingredients = [];
   
    ingredientList.querySelectorAll(".ingredient-text").forEach(function (item) {
        ingredients.push(item.textContent.trim());
      });

    const procedures = [];
    
    procedureList.querySelectorAll("li").forEach(function (item) {
        procedures.push(item.textContent.trim());
      });

    const newRecipeData = {
      name: recipeName.value,
      description: recipeDesc.value,
      image: recipeImage.value,
      ingredients: ingredients,
      instructions: procedures,
      owner: recipeOwner.value,
    };

    displayCards(newRecipeData);
    formContainer.classList.add("hidden");

    // fetch("http://localhost:3000/recipes", {
    fetch("https://recipe-server-su9a.onrender.com/api/recipes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(newRecipeData),
    })
      .then((res) => res.json())
      .then((newdata) => console.log("recipe posted successfully", newdata));
  }

  //function for editing the ingridients and procedures

  function editIngridientsAndProcedures() {}

  let slideIndex = 0;

  // Function to show slides
  function showSlides() {
    let slides = document.querySelectorAll(".slide");
    // Hide all slides
    slides.forEach((slide) => (slide.style.display = "none"));
    // Move to the next slide
    slideIndex++;
    // Reset to first slide if at the end
    if (slideIndex > slides.length) {
      slideIndex = 1;
    }
    // Show the current slide
    slides[slideIndex - 1].style.display = "block";
    setTimeout(showSlides, 3000);
  }

  // Function to change slide manually
  function changeSlide(n) {
    slideIndex += n - 1;
    showSlides();
  }

  // Start the slideshow
  showSlides();

  getRecipes();
});
