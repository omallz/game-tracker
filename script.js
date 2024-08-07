function displayData(data) {
    const container = document.getElementById('data-container');
    container.innerHTML = ''; // Clear previous data
    container.classList.add('row');
    container.classList.add('g-3');
    container.classList.add('row-cols-2');
    container.classList.add('row-cols-md-4');

    data.forEach(item => {

        const gameCol = document.createElement('div');
        gameCol.classList.add('col');

        const gameCard = document.createElement('div');
        gameCard.classList.add('card', 'h-100');

        const gameCardBody = document.createElement('div');
        gameCardBody.classList.add('card-body');

        /* image */
        const img = document.createElement('img');
        img.src = 'https://picsum.photos/200/300'; // Placeholder image URL
        img.alt = `${item.gameTitle} cover image`;
        img.classList.add('card-img-top','game-image');

        /* game title */
        const gameCardTitle = document.createElement('h5');
        gameCardTitle.classList.add('card-title');
        gameCardTitle.textContent = `${item.gameTitle}`;

        /* added to gamepass */
        const gameAddedDate = document.createElement('p');
        gameAddedDate.classList.add('card-text');
        const date = new Date(item.gamepassAddDate + '-01'); // Add day to create a valid date
        const formattedDate = date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
        gameAddedDate.innerHTML = `<i class="fa-regular fa-calendar-plus fa-fw"></i> ${formattedDate}`;

        // Calculate the difference in months
        const currentDate = new Date();
        const diffTime = currentDate - date;
        const diffMonths = diffTime / (1000 * 60 * 60 * 24 * 30);

        // Apply background colors based on the difference in months
        if (diffMonths >= 10) {
            gameCard.style.backgroundColor = '#f3a7ae'; // 10 months or more
        } else if (diffMonths >= 6) {
            gameCard.style.backgroundColor = '#fff3cd'; // 6 months or more
        } else {
            gameCard.style.backgroundColor = '#bcd7ca'; // recent
        }

        /* Add the card, image and card-body */
        gameCol.appendChild(gameCard);
        gameCard.appendChild(img);
        gameCard.appendChild(gameCardBody);

        /* Add the content of card-body */
        gameCardBody.appendChild(gameCardTitle);
        gameCardBody.appendChild(gameAddedDate);
        container.appendChild(gameCol);

    });

}

document.addEventListener('DOMContentLoaded', function() {
    fetch('https://gamingbacklog.infinityfreeapp.com/proxy.php', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        mode: 'cors', // Ensure CORS mode is enabled
        cache: 'no-cache',
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        displayData(data);
    })
    .catch(error => {
        console.error('Error:', error);
        displayErrorMessage(error);
    });
});

function displayErrorMessage(error) {
    const errorContainer = document.createElement('div');
    errorContainer.style.color = 'red';
    errorContainer.textContent = `An error occurred: ${error.message}`;
    document.body.appendChild(errorContainer);
}
