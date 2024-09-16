let page = 1;
let allMovies = [];

const url = (page) =>
  `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&page=${page}`;

document.addEventListener("DOMContentLoaded", () => {
  const searchbar = document.getElementById("searchbar");
  const movieContainer = document.getElementById("movie-container");
  const previousBtn = document.getElementById("previous-page");
  const nextPageBtn = document.getElementById("next-page");
  const pageNumberDisplay = document.getElementById("page-number");
  const fourStarsCount = document.getElementById("four-stars-count");
  const threeStarsCount = document.getElementById("three-stars-count");
  const twoStarsCount = document.getElementById("two-stars-count");
  const oneStarCount = document.getElementById("one-star-count");
  const zeroStarsCount = document.getElementById("zero-stars-count");

  function fetchMovies(page) {
    fetch(url(page))
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        allMovies = data.results;
        displayMovies(allMovies);
        startSlider(allMovies);
        updatePaginationControls();
        updateResultsCounter(allMovies);
      })
      .catch((error) => {
        console.error("Error fetching movies:", error);
      });
  }

  fetchMovies(page);

  function displayMovies(movies) {
    movieContainer.innerHTML = ""; // Clear previous movies
    movies.forEach((movie) => {
      const movieDiv = document.createElement("div");
      let emoji = "";
      if (movie.vote_average >= 8) {
        emoji = "⭐️⭐️⭐️⭐️";
      } else if (movie.vote_average >= 6) {
        emoji = "⭐️⭐️⭐️";
      } else if (movie.vote_average >= 4) {
        emoji = "⭐️⭐️";
      } else {
        emoji = "🗑️";
      }

      movieDiv.classList.add("movie-card");
      movieDiv.innerHTML = `
        <img src="https://image.tmdb.org/t/p/w500/${movie.poster_path}" />
        <h1>${movie.title}</h1>
        <p>Release Date: ${movie.release_date}</p>
        <p>Rating: ${emoji}</p>
      `;

      movieDiv.querySelector("img").addEventListener("click", () => {
        document.getElementById(
          "modal-poster"
        ).src = `https://image.tmdb.org/t/p/w500/${movie.poster_path}`;
        document.getElementById("modal-title").textContent = movie.title;
        document.getElementById("modal-overview").textContent = movie.overview;
        document.getElementById("modal-rating").textContent =
          movie.vote_average;
        document.getElementById("modal-release").textContent =
          movie.release_date;
        document.getElementById("movie-modal").style.display = "block";

        const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
        const isFavorite = favorites.some((fav) => fav.title === movie.title);
        const addFavoritesButton = document.getElementById("add-fav-btn");
        if (isFavorite) {
          addFavoritesButton.classList.add("added");
          addFavoritesButton.textContent = "Added";
        } else {
          addFavoritesButton.classList.remove("added");
          addFavoritesButton.textContent = "Add to Favorites";
        }

        addFavoritesButton.onclick = () => {
          const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
          const isFavorite = favorites.some((fav) => fav.title === movie.title);
          if (!isFavorite) {
            favorites.push({
              title: movie.title,
              poster_path: `https://image.tmdb.org/t/p/w500/${movie.poster_path}`,
              date: movie.release_date,
              rating: movie.vote_average,
            });
            localStorage.setItem("favorites", JSON.stringify(favorites));
            addFavoritesButton.classList.add("added");
            addFavoritesButton.textContent = "Added";
            removeMovieFromMain(movie.title);
          } else {
            const updatedFavorites = favorites.filter(
              (fav) => fav.title !== movie.title
            );
            localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
            addFavoritesButton.classList.remove("added");
            addFavoritesButton.textContent = "Add to Favorites";
            addMovieToMain(movie);
          }
          displayFavorites();
        };
      });

      movieContainer.appendChild(movieDiv);
    });
  }

  function updateResultsCounter(movies) {
    let fourStars = 0;
    let threeStars = 0;
    let twoStars = 0;
    let oneStar = 0;
    let zeroStars = 0;

    movies.forEach((movie) => {
      if (movie.vote_average >= 8) {
        fourStars++;
      } else if (movie.vote_average >= 6) {
        threeStars++;
      } else if (movie.vote_average >= 4) {
        twoStars++;
      } else if (movie.vote_average >= 2) {
        oneStar++;
      } else {
        zeroStars++;
      }
    });

    fourStarsCount.textContent = `⭐️⭐️⭐️⭐️ Stars: ${fourStars}`;
    threeStarsCount.textContent = `⭐️⭐️⭐️ Stars: ${threeStars}`;
    twoStarsCount.textContent = `⭐️⭐️ Stars: ${twoStars}`;
    oneStarCount.textContent = `⭐️ Stars: ${oneStar}`;
    zeroStarsCount.textContent = `🗑️ Stars: ${zeroStars}`;
  }

  function removeMovieFromMain(title) {
    allMovies = allMovies.filter((movie) => movie.title !== title);
    displayMovies(allMovies);
  }

  function addMovieToMain(movie) {
    allMovies.push(movie);
    displayMovies(allMovies);
  }

  searchbar.addEventListener("input", (event) => {
    const searchTerm = event.target.value.toLowerCase();
    const filteredMovies = allMovies.filter((movie) =>
      movie.title.toLowerCase().includes(searchTerm)
    );
    movieContainer.innerHTML = "";
    displayMovies(filteredMovies);
  });

  function removeFromFavorites(index) {
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    const removedMovie = favorites.splice(index, 1)[0];
    localStorage.setItem("favorites", JSON.stringify(favorites));
    displayFavorites();
    addMovieToMain(removedMovie);
  }

  function displayFavorites() {
    const favoritesContainer = document.getElementById("favorites-container");
    favoritesContainer.innerHTML = "";

    const closeButton = document.createElement("span");
    closeButton.classList.add("exit-fav-btn");
    closeButton.textContent = "×";
    closeButton.addEventListener("click", () => {
      favoritesContainer.style.display = "none";
    });
    favoritesContainer.appendChild(closeButton);

    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    if (favorites.length === 0) {
      const funnyMessage = document.createElement("h1");
      funnyMessage.textContent = "Wow, such emptyness!";
      favoritesContainer.appendChild(funnyMessage);
    }
    favorites.forEach((movie, index) => {
      const favoriteDiv = document.createElement("div");
      favoriteDiv.classList.add("favorite-card");
      favoriteDiv.innerHTML = `
        <img src="${movie.poster_path}" />
        <h1>${movie.title}</h1>
        <button class="remove-fav-btn" data-index="${index}">Remove from favorites</button>
      `;
      favoritesContainer.appendChild(favoriteDiv);
    });

    const removeButtons = document.querySelectorAll(".remove-fav-btn");
    removeButtons.forEach((button) => {
      button.addEventListener("click", (event) => {
        const index = event.target.getAttribute("data-index");
        removeFromFavorites(index);
      });
    });
  }

  document.getElementById("close-modal").addEventListener("click", () => {
    document.getElementById("movie-modal").style.display = "none";
  });

  const favoritesButton = document.getElementById("fav-btn");
  const exitFavoritesButton = document.getElementById("exit-favorites-btn");

  favoritesButton.addEventListener("click", () => {
    const favoritesContainer = document.getElementById("favorites-container");
    if (favoritesContainer.style.display === "flex") {
      favoritesContainer.style.display = "none";
      document.querySelector(".top-bar").style.visibility = "visible";
    } else {
      favoritesContainer.style.display = "flex";
      document.querySelector(".top-bar").style.visibility = "visible";
      displayFavorites();
    }
  });

  exitFavoritesButton.addEventListener("click", () => {
    const favoritesContainer = document.getElementById("favorites-container");
    favoritesContainer.style.display = "none";
    document.querySelector(".top-bar").style.visibility = "visible";
  });

  const sliderContainer = document.getElementById("movie-slider");
  const sliderBackdrop = document.getElementById("slider-backdrop");
  const sliderTitle = document.getElementById("slider-title");
  const sliderDate = document.getElementById("slider-date");
  let currentIndex = 0;

  function updateSlider(movies) {
    const movie = movies[currentIndex];
    sliderBackdrop.style.backgroundImage = `url(https://image.tmdb.org/t/p/original/${movie.backdrop_path})`;
    sliderTitle.textContent = movie.title;
    sliderDate.textContent = movie.release_date;
  }

  function startSlider(movies) {
    updateSlider(movies);
    setInterval(() => {
      currentIndex = (currentIndex + 1) % movies.length;
      updateSlider(movies);
    }, 20000);
  }

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  document.getElementById("filter-btn").addEventListener("click", () => {
    const filterOptions = document.getElementById("filter-options");
    filterOptions.style.display =
      filterOptions.style.display === "none" ? "block" : "none";
  });

  document.getElementById("sort-az").addEventListener("click", () => {
    sortMovies("az");
  });

  document.getElementById("sort-za").addEventListener("click", () => {
    sortMovies("za");
  });

  function sortMovies(order) {
    const movieContainer = document.getElementById("movie-container");
    let movies = Array.from(
      movieContainer.getElementsByClassName("movie-card")
    );
    movies.sort((a, b) => {
      const titleA = a.querySelector("h1").textContent.toUpperCase();
      const titleB = b.querySelector("h1").textContent.toUpperCase();
      if (order === "az") {
        return titleA < titleB ? -1 : titleA > titleB ? 1 : 0;
      } else {
        return titleA > titleB ? -1 : titleA < titleB ? 1 : 0;
      }
    });
    movieContainer.innerHTML = "";
    movies.forEach((movie) => movieContainer.appendChild(movie));
  }

  function updatePaginationControls() {
    pageNumberDisplay.textContent = `Page ${page}`;
    previousBtn.disabled = page === 1;
  }

  previousBtn.addEventListener("click", () => {
    if (page > 1) {
      page--;
      fetchMovies(page);
    }
  });

  nextPageBtn.addEventListener("click", () => {
    page++;
    fetchMovies(page);
  });

  fetchMovies(page);
});
