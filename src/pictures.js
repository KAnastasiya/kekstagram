'use strict';

var picturesContainer = document.querySelector('.pictures'),
  pictureTemplate = document.querySelector('#picture-template'),
  pictureToClone;

document.querySelector('.filters').classList.add('hidden');

if ('content' in pictureTemplate) {
  pictureToClone = pictureTemplate.content.querySelector('.picture');
} else {
  pictureToClone = pictureTemplate.querySelector('.picture');
}

var getPicture = function(data) {
  var element = pictureToClone.cloneNode(true),
    pictureImage = new Image(182, 182),
    pictureLoadTimeout;

  element.querySelector('.picture-comments').textContent = data.comments;
  element.querySelector('.picture-likes').textContent = data.likes;
  picturesContainer.appendChild(element);

  pictureImage.onload = function() {
    clearTimeout(pictureLoadTimeout);
    element.querySelector('img').src = pictureImage.src;
  };

  pictureImage.onerror = function() {
    element.classList.add('picture-load-failure');
  };

  pictureImage.src = data.url;

  pictureLoadTimeout = setTimeout( function() {
    pictureImage.src = '';
    element.classList.add('picture-load-failure');
  }, 10000);
};

window.pictures.forEach(getPicture);

document.querySelector('.filters').classList.remove('hidden');

