// Function to fetch game data from SheetDB
async function fetchSheetdbData() {
    try {
        const response = await fetch('https://gaming-backlog-proxy-server-abba15e1c367.herokuapp.com/proxy.php?api=sheetdb');
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching data from SheetDB:', error);
    }
}

// Function to fetch game data from IGDB
async function fetchIgdbData(gameTitle) {
    try {
        const response = await fetch(`https://gaming-backlog-proxy-server-abba15e1c367.herokuapp.com/proxy.php?api=igdb&search=${encodeURIComponent(gameTitle)}`);
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching data from IGDB:', error);
    }
}

// Function to update game cards with fetched data
async function updateGameCards(data) {
    const container = document.getElementById('data-container');
    container.innerHTML = ''; // Clear previous data
    container.classList.add('row', 'g-3', 'row-cols-2', 'row-cols-md-4');

    for (const item of data) {
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
        img.classList.add('card-img-top', 'game-image');
        img.loading = 'lazy'; // Enable lazy loading

        // Fetch cover image, name, and rating from IGDB
        const igdbData = await fetchIgdbData(item.gameTitle);
        if (igdbData && igdbData.length > 0) {
            if (igdbData[0].cover) {
                // Modify the cover URL to specify the width
                const coverUrl = igdbData[0].cover.url.replace('t_thumb', 't_cover_big'); // Example size
                img.src = coverUrl;
            }
            if (igdbData[0].name) {
                item.gameTitle = igdbData[0].name; // Update game title with IGDB name
            }
            if (igdbData[0].aggregated_rating) {
                const rating = document.createElement('p');
                rating.classList.add('card-text');
                rating.innerHTML = `<i class="fa-regular fa-star fa-fw"></i> Rating: ${igdbData[0].aggregated_rating.toFixed(1)}`;
                gameCardBody.appendChild(rating);
            }
        }

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
    }
}

document.addEventListener('DOMContentLoaded', function() {
    fetchSheetdbData().then(data => {
        if (data) {
            updateGameCards(data);
        }
    }).catch(error => console.error('Error:', error));
});
