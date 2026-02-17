import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

import { getImagesByQuery } from './js/pixabay-api.js';
import {
  createGallery,
  clearGallery,
  showLoader,
  hideLoader,
  showLoadMoreButton,
  hideLoadMoreButton,
} from './js/render-functions.js';

const form = document.querySelector('.form');
const loadMoreBtn = document.querySelector('.load-more-btn');

let currentQuery = '';
let page = 1;
const perPage = 15;
let totalHits = 0;

form.addEventListener('submit', onSearchSubmit);
loadMoreBtn.addEventListener('click', onLoadMoreClick);

async function onSearchSubmit(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const query = formData.get('search-text').trim();

  if (!query) {
    iziToast.error({
      message: 'Please enter a search query!',
      position: 'topRight',
    });
    return;
  }

  currentQuery = query;
  page = 1;

  clearGallery();
  hideLoadMoreButton();
  showLoader();

  try {
    const data = await getImagesByQuery(currentQuery, page);
    totalHits = data.totalHits;

    if (data.hits.length === 0) {
      iziToast.error({
        message: 'Sorry, there are no images matching your search query.',
        position: 'topRight',
      });
      return;
    }

    createGallery(data.hits);

    if (page * perPage < totalHits) {
      showLoadMoreButton();
    }
  } catch {
    iziToast.error({
      message: 'Something went wrong. Try again later.',
      position: 'topRight',
    });
  } finally {
    hideLoader();
    form.reset();
  }
}

async function onLoadMoreClick() {
  page += 1;
  showLoader();
  hideLoadMoreButton();

  try {
    const data = await getImagesByQuery(currentQuery, page);

    createGallery(data.hits);

    const { height } = document
      .querySelector('.gallery-item')
      .getBoundingClientRect();

    window.scrollBy({
      top: height * 2,
      behavior: 'smooth',
    });

    if (page * perPage >= totalHits) {
      iziToast.info({
        message: "You've reached the end of search results.",
        position: 'topRight',
      });
    } else {
      showLoadMoreButton();
    }
  } catch {
    iziToast.error({
      message: 'Something went wrong. Try again later.',
      position: 'topRight',
    });
  } finally {
    hideLoader();
  }
}
