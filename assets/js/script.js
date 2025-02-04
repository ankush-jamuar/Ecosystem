/*=============== SHOW MENU ===============*/
// const navMenu = document.getElementById("nav-menu"),
//   navToggle = document.getElementById("nav-toggle"),
//   navClose = document.getElementById("nav-close")

// /* Menu show */
// if (navToggle) {
//   navToggle.addEventListener("click", () => {
//     navMenu.classList.add("show-menu")
//   })
// }

// /* Menu hidden */
// if (navClose) {
//   navClose.addEventListener("click", () => {
//     navMenu.classList.remove("show-menu")
//   })
// }

// /*=============== REMOVE MENU MOBILE ===============*/
// const navLink = document.querySelectorAll(".nav-link")

// const linkAction = () => {
//   const navMenu = document.getElementById("nav-menu")
//   // When we click on each nav-link, we remove the show-menu class
//   navMenu.classList.remove("show-menu")
// }
// navLink.forEach(n => n.addEventListener("click", linkAction))
/*=============== BLUR HEADER ===============*/
// const blurHeader = () => {
//   const header = document.getElementById("header")
// Add a class if the bottom offset is greater than 50 of the viewport
//   this.scrollY >= 50
//     ? header.classList.add("blur-header")
//     : header.classList.remove("blur-header")
// }
// window.addEventListener("scroll", blurHeader)

// /*=============== SHOW SCROLL UP ===============*/
// const scrollUp = () => {
//   const scrollUp = document.getElementById("scroll-up")
//   // When the scroll is higher than 350 viewport height, add the show-scroll class to the a tag with the scrollup class
//   this.scrollY >= 350
//     ? scrollUp.classList.add("show-scroll")
//     : scrollUp.classList.remove("show-scroll")
// }
// window.addEventListener("scroll", scrollUp)

/*=============== SCROLL SECTIONS ACTIVE LINK ===============*/
// const sections = document.querySelectorAll("section[id]")

// const scrollActive = () => {
//   const scrollDown = window.scrollY

//   sections.forEach(current => {
//     const sectionHeight = current.offsetHeight,
//       sectionTop = current.offsetTop - 58,
//       sectionId = current.getAttribute("id"),
//       sectionsClass = document.querySelector(
//         ".nav-menu a[href*=" + sectionId + "]"
//       )

//     if (scrollDown > sectionTop && scrollDown <= sectionTop + sectionHeight) {
//       sectionsClass.classList.add("active-link")
//     } else {
//       sectionsClass.classList.remove("active-link")
//     }
//   })
// }
// window.addEventListener("scroll", scrollActive)
// ;

"use strict"

import { fetchData, url } from "./api.js"
import * as module from "./module.js"

/**
 * Add event listeners to multiple elements
 * @param {NodeList} elements - Element's node array
 * @param {string} eventType - Event Type .g, "click", "hover"
 * @param {Function} callback - callback function
 */
const addEventOnElements = function (elements, eventType, callback) {
  for (const elem of elements) elem.addEventListener(eventType, callback)
}

/**
 * Toggle search in mobile devices
 */
const searchView = document.querySelector("[data-search-view]")
const searchToggler = document.querySelectorAll("[data-search-toggler]")

const toggleSearch = () => searchView.classList.toggle("active")
addEventOnElements(searchToggler, "click", toggleSearch)

/**
 * API search Integration
 */
const searchField = document.querySelector("[data-search-field]")
const searchResult = document.querySelector("[data-search-result]")

let searchTimeout = null
let searchTimeoutDuration = 500

searchField.addEventListener("input", () => {
  searchTimeout ?? clearTimeout(searchTimeout)

  if (!searchField.value) {
    searchResult.classList.remove("active")
    searchResult.innerHTML = ""
    searchField.classList.remove("searching")
  } else {
    searchField.classList.add("searching")
  }

  if (searchField.value) {
    searchTimeout = setTimeout(() => {
      fetchData(url.geoCoding(searchField.value), function (locations) {
        searchField.classList.remove("searching")
        searchResult.classList.add("active")
        searchResult.innerHTML = `
          <ul class="view-list" data-search-list></ul>`
        const items = []
        for (const { name, lat, lon, country, state } of locations) {
          const searchItem = document.createElement("li")
          searchItem.classList.add("view-item")

          searchItem.innerHTML = `
            <span class="m-icon">location_on</span>
            <div>
              <p class="item-title">${name}</p>
              <p class="label-2 item-subtitle">${state || ""}, ${country}</p>
            </div>

            <a
              href="#/weather?lat=${lat}&lon=${lon}"
              class="item-link has-state"
              aria-label="${name} weather"
              data-search-toggler
            ></a>
          `
          searchResult
            .querySelector("[data-search-list]")
            .appendChild(searchItem)
          items.push(searchItem.querySelector("[data-search-toggler]"))
        }
        addEventOnElements(items, "click", function () {
          toggleSearch()
          searchResult.classList.remove("active")
        })
      })
    }, searchTimeoutDuration)
  }
})

const container = document.querySelector("[data-container]")
const loading = document.querySelector("[data-loading-screen]")
const currentLocationBtn = document.querySelector("[data-current-location-btn]")
const errorContent = document.querySelector("[data-error-content]")

/**
 *Dsiplay all the weather data in the HTML page.
 *
 * @param {number} lat - Latitude value
 * @param {number} lon - Longitude value
 */
export const updateWeather = (lat, lon) => {
  loading.style.display = "grid"
  container.style.overflowY = "hidden"
  container.classList.remove("fade-in")

  // errorContent.style.display = "none"

  const currentWeatherSection = document.querySelector("[data-current-weather]")
  const hightlightSection = document.querySelector("[data-highlights]")
  const hourlyForecastSection = document.querySelector("[data-hourly-forecast]")
  const fiveDaysForecast = document.querySelector("[data-5-day-forecast]")

  currentWeatherSection.innerHTML = ""
  hightlightSection.innerHTML = ""
  hourlyForecastSection.innerHTML = ""
  fiveDaysForecast.innerHTML = ""

  if (window.location.hash === "#/current-location") {
    currentLocationBtn.setAttribute("disabled", "")
  } else {
    currentLocationBtn.removeAttribute("disabled")
  }

  /**
   * Current Weather
   */
  fetchData(url.currentWeather(lat, lon), currentWeather => {
    const {
      weather,
      dt: dateUnix,
      sys: { sunrise: sunriseUnixUTC, sunset: sunsetUnixUTC },
      main: { temp, feels_like, pressure, humidity },
      visibility,
      timezone,
    } = currentWeather
    const [{ description, icon }] = weather

    const card = document.createElement("div")
    card.classList.add("card", "card-lg", "current-weather-card")
    card.innerHTML = `
            <h2 class="title-2 card-title">Now</h2>
            <div class="wrapper">
              <p class="heading">${parseInt(temp)}&deg;<sup>C</sup></p>
                <img
                src="./assets/images/weather_icons/${icon}.png"
                width="64"
                height="64"
                alt="${description}"
                class="weather-icon"
                />
            </div>
              <p class="body-3">${description}</p>
              <ul class="meta-list">
                <li class="meta-item">
                  <span class="m-icon">calendar_today</span>
                  <p class="title-3 meta-text">${module.getDate(
                    dateUnix,
                    timezone
                  )}</p>
                </li>
                <li class="meta-item">
                  <span class="m-icon">location_on</span>
                  <p class="title-3 meta-text" data-location></p>
                </li>
              </ul>
            `

    fetchData(url.reverseGeo(lat, lon), ([{ name, country }]) => {
      card.querySelector("[data-location]").innerHTML = `${name}, ${country}`
    })

    currentWeatherSection.appendChild(card)

    /**
     * Today's highlights
     */
    fetchData(url.airPollution(lat, lon), airPollution => {
      const [
        {
          main: { aqi },
          components: { no2, o3, so2, pm2_5 },
        },
      ] = airPollution.list

      const card = document.createElement("div")
      card.classList.add("card", "card-lg")

      card.innerHTML = `
        <h2 class="title-2" id="hightlights-label">Today's Highlights</h2>
        <div class="highlights-list">
          <div class="card card-sm highlight-card one">
            <h3 class="title-3">Air Quality Index</h3>
            <div class="wrapper">
              <span class="m-icon">air</span>
              <ul class="card-list">
                <li class="card-item">
                  <p class="title-1">${pm2_5.toPrecision(3)}</p>
                  <p class="label-1">PM<sub>2.5</sub></p>
                </li>
                <li class="card-item">
                  <p class="title-1">${so2.toPrecision(3)}</p>
                  <p class="label-1">SO<sub>2</sub></p>
                </li>
                <li class="card-item">
                  <p class="title-1">${no2.toPrecision(3)}</p>
                  <p class="label-1">NO<sub>2</sub></p>
                </li>
                <li class="card-item">
                  <p class="title-1">${o3.toPrecision(3)}</p>
                  <p class="label-1">O<sub>3</sub></p>
                </li>
              </ul>
            </div>
            <span
              class="badge aqi-${aqi} label-${aqi}"
              title="${module.airQualityIndexText[aqi].message}"
              >${module.airQualityIndexText[aqi].level}</span
            >
          </div>
          <div class="card card-sm highlight-card two">
            <h3 class="title-3">Sunrise & Sunset</h3>
            <div class="card-list">
              <div class="card-item">
                <span class="m-icon">clear_day</span>
                <div>
                  <p class="label-1">Sunrise</p>
                  <p class="title-1">
                    ${module.getTime(sunriseUnixUTC, timezone)}
                  </p>
                </div>
              </div>
              <div class="card-item">
                <span class="m-icon">clear_night</span>
                <div>
                  <p class="label-1">Sunset</p>
                  <p class="title-1">
                    ${module.getTime(sunsetUnixUTC, timezone)}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div class="card card-sm hightlight-card three">
            <h3 class="title-3">Humidity</h3>
            <div class="wrapper">
              <span class="m-icon">humidity_percentage</span>
              <p class="title-1">${humidity}<sub>%</sub></p>
            </div>
          </div>
          <div class="card card-sm hightlight-card four">
            <h3 class="title-3">Pressure</h3>
            <div class="wrapper">
              <span class="m-icon">airwave</span>
              <p class="title-1">${pressure}<sub>hPa</sub></p>
            </div>
          </div>
          <div class="card card-sm hightlight-card five">
            <h3 class="title-3">Visibility</h3>
            <div class="wrapper">
              <span class="m-icon">visibility</span>
              <p class="title-1">${visibility / 1000}<sub>km</sub></p>
            </div>
          </div>
          <div class="card card-sm hightlight-card six">
            <h3 class="title-3">Feels Like</h3>
            <div class="wrapper">
              <span class="m-icon">thermostat</span>
              <p class="title-1">${parseInt(feels_like)}&deg;<sup>C</sup></p>
            </div>
          </div>
        </div>
      `
      hightlightSection.appendChild(card)
    })

    /**
     * 24 Hours Forecast Section
     */
    fetchData(url.forecast(lat, lon), forecast => {
      const {
        list: forecastList,
        city: { timezone },
      } = forecast

      hourlyForecastSection.innerHTML = `
        <h2 class="title-2">Today at</h2>
        <div class="slider-container">
          <ul class="slider-list" data-temp></ul>
          <ul class="slider-list" data-wind></ul>
        </div>
      `

      for (const [index, data] of forecastList.entries()) {
        if (index > 7) break

        const {
          dt: dateTimeUnix,
          main: { temp },
          weather,
          wind: { deg: windDirection, speed: windSpeed },
        } = data

        const [{ icon, description }] = weather

        const tempList = document.createElement("li")
        tempList.classList.add("slider-item")
        tempList.innerHTML = `
          <div class="card card-sm slider-card">
            <p class="body-3">${module.getHours(dateTimeUnix, timezone)}</p>
            <img
              src="./assets/images/weather_icons/${icon}.png"
              width="48"
              height="48"
              loading="lazy"
              alt="${description}"
              class="weather-icon"
              title="${description}"
            />
            <p class="body-3">${parseInt(temp)}&deg;</p>
          </div>
        `

        hourlyForecastSection.querySelector("[data-temp]").appendChild(tempList)

        const windList = document.createElement("li")
        windList.classList.add("slider-item")
        windList.innerHTML = `
          <div class="card card-sm slider-card">
            <p class="body-3">${module.getHours(dateTimeUnix, timezone)}</p>
            <img
              src="./assets/images/weather_icons/direction.png"
              width="48"
              height="48"
              loading="lazy"
              alt="direction"
              class="weather-icon"
              style="transform: rotate(${windDirection - 180}deg)"
            />
            <p class="body-3">${parseInt(module.mpsTokmph(windSpeed))} km/h</p>
          </div>
        `
        hourlyForecastSection.querySelector("[data-wind]").appendChild(windList)
      }

      /**
       * 5 Days Forecast Section
       */
      fiveDaysForecast.innerHTML = `
        <h2 class="title 2" id="forecast-label">5 Days Forecast</h2>
        <div class="card card-lg forecast-card">
          <ul data-forecast-list></ul>
        </div>
      `

      for (let i = 7, len = forecastList.length; i < len; i += 8) {
        const {
          main: { temp_max },
          weather,
          dt_txt,
        } = forecastList[i]

        const [{ icon, description }] = weather
        const date = new Date(dt_txt)

        const li = document.createElement("li")
        li.classList.add("card-item")

        li.innerHTML = `
          <div class="icon-wrapper">
            <img
              src="./assets/images/weather_icons/${icon}.png"
              width="36"
              height="36"
              alt="${description}"
              class="weather-icon"
              title="${description}"
            />
            <span class="span">
              <p class="title-2">${parseInt(temp_max)}&deg;</p>
            </span>
          </div>

          <p class="label-1">
            ${date.getDate()} ${module.nameOfTheMonths[date.getUTCMonth()]}
          </p>
          <p class="label-1">${module.daysOfTheWeek[date.getUTCDay()]}</p>
        `
        fiveDaysForecast.querySelector("[data-forecast-list").appendChild(li)
      }

      loading.style.display = "none"
      container.style.overflowY = "overlay"
      container.classList.add("fade-in")
    })
  })
}

export const error404 = () => (errorContent.style.display = "flex")

/*=============== SCROLL REVEAL ANIMATION ===============*/
const sr = ScrollReveal({
  origin: "top",
  distance: "80px",
  duration: 2500,
  delay: 300,
  // reset: true, //Animations repeat
})

sr.reveal(`.home-img, .care-img, .footer`)
sr.reveal(`.home-data, .care-list`, { delay: 500 })
sr.reveal(`h2.section-title`, { delay: 500 })
sr.reveal(`.news-card`, { delay: 500, interval: 100 })
