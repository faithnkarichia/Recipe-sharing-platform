document.addEventListener("DOMContentLoaded", function () {
  const recipeCardsContainer = document.querySelector(
    ".recipe-cards-container"
  );
  const addBtn = document.querySelector(".add-btn");
  const searchText = document.querySelector(".search-text");
  const searchBtn = document.querySelector(".search-button");
  const procedureCard = document.querySelector(".procedure-card");

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
  let recipes = [];
  let slidePrev = document.querySelector(".prev");
  let slideNext = document.querySelector(".next");

  //function for getting all the recipes using GET method

  function getRecipes() {
    fetch("https://recipe-server-su9a.onrender.com/api/recipes")
      .then((res) => res.json())
      .then((data) => {
        recipes = data;
        recipes &&
          recipes.forEach((recipe) => {
            displayCards(recipe);
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

    const heartIcon = recipe.loves > 0 ? '<i class="fa-solid fa-heart"></i>' : '<i class="fa-regular fa-heart"></i>';

    recipeCard.innerHTML = `
        <h3 class="recipe-title">${recipe.name}</h3>
        <img src="${recipe.image}" alt="Recipe Image" class="recipe-image">
        <p class="recipe-description">${recipe.description}</p>
        <p class="recipe-owner">By: ${recipe.owner}</p>
        <div class="recipe-actions">
            <button class="love-btn">${recipe.loves || 0}${heartIcon}</button>
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

            // Toggle "love"
            if (loveButton.querySelector('.fa-regular')) { 
                addLoves(recipe, loveButton);
            } else {
                removeLove(recipe, loveButton); 
            }
        });
    }
}

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
            loveButton.innerHTML = `${updatedRecipe.loves}<i class="fa-solid fa-heart"></i>`; // Filled heart
        }
        displayMostLovedRecipes();
    })
    .catch((error) => {
        console.error("Error updating loves:", error);
    });

    return recipe.loves;
}

function removeLove(recipe, loveButton) {
    if (recipe.loves > 0) {
        recipe.loves--;
    }

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
        console.log("Love removed:", updatedRecipe);
        const index = recipes.findIndex((r) => r.id === recipe.id);
        if (index !== -1) {
            recipes[index].loves = updatedRecipe.loves;
        }

        if (loveButton) {
            loveButton.innerHTML = `${updatedRecipe.loves}<i class="fa-regular fa-heart"></i>`; 
        }
        displayMostLovedRecipes();
    })
    .catch((error) => {
        console.error("Error removing love:", error);
    });

    return recipe.loves;
}


  //function for displaying most loved recipes on the aside
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

  addBtn.addEventListener("click", (e) => {
    formContainer.classList.remove("hidden");
  });
  closeFormBtn.addEventListener("click", () => {
    formContainer.classList.add("hidden");
  });

  // function for adding ingridients and procedures inside the form
  function addListItemWithEdit(inputElement, listElement, textClassName) {
    const value = inputElement.value.trim();
    if (value) {
      const listItem = document.createElement("li");
      const textElement = document.createElement("span");
      textElement.className = textClassName;
      textElement.textContent = value;
      const editBtn = document.createElement("button");
      editBtn.textContent = "edit";
      editBtn.classList.add("edit");
      listItem.appendChild(textElement);
      listItem.appendChild(editBtn);
      listElement.appendChild(listItem);
      inputElement.value = "";
      editBtn.addEventListener("click", () => {
        inputElement.value = textElement.textContent.trim();
        listItem.remove();
      });
    }
  }

  addIngredientBtn.addEventListener("click", function () {
    addListItemWithEdit(ingredientInput, ingredientList, "ingredient-text");
  });

  addProcedureBtn.addEventListener("click", function () {
    addListItemWithEdit(procedureInput, procedureList, "ingredient-text");
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
    ingredientList
      .querySelectorAll(".ingredient-text")
      .forEach(function (item) {
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

    fetch("https://recipe-server-su9a.onrender.com/api/recipes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(newRecipeData),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((newdata) => {
        console.log("Recipe posted successfully", newdata);
      })
      .catch((error) => {
        console.error("Error posting recipe:", error);
        alert("Failed to post recipe. Please try again.");
      });
  }

  // Function to show slides
  let slideIndex = 0;
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

  // Start the slideshow
  showSlides();

  getRecipes();
});
