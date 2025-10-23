# Objectives

## Backend

- netlify function to create a video with the open ai sora 2 api and write the completed video to netlify blob storage with the job Id as the filename
- netlify function to get the video from the open ai sora 2 api
- netlify function to check the status of a sora 2 api video that is being created

## Frontend

- nextjs app using typescript that allows a user to enter the description of a dream
- the app should have a button that sends the description to the netlify function to create a video within a formatted prompts
- the app checks the status of the video every x seconds until the video is ready
- the app downloads the video when the video has been created
- the app allows the user to play the video once downloaded
- the app stores the job id's for the videos that a user has created in local storage
- the app allows the user to select job id's from a drop down and download the video

