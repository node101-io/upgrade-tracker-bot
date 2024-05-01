# Upgrade Tracker Bot

Welcome to the official repository for the **Upgrade Tracker Bot**. This bot is designed to track the software upgrades of Cosmos Mainnet chains and notify the user regularly. Below you'll find the essential information to get started, including system requirements, database setup, customization options, and operational insights.

## Minimum System Requirements

To ensure smooth operation of the bot, your system should meet the following minimum requirements:
-   **RAM:**  2GB
-   **CPU:**  1 core

These requirements are sufficient for handling the bot's operations under normal usage conditions.

## Setting Up MongoDB

The bot uses MongoDB as its database. For development and small-scale applications, MongoDB's free plan is sufficient. You can set up a MongoDB database at  [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).

## Customizing Message Frequency

The frequency of message dispatch by the bot can be customized via environment variables in the  `.env`  file. To change the message frequency, you can adjust the relevant variable.

## Hourly Messages

The decision to send messages on an hourly basis was made to avoid overwhelming users with too much information at once and to make tracking updates more manageable. This approach helps in maintaining a clear and organized chain of communication.

## Marking Upgrades As Done

In the context of the bot, marking updates as done means that the user don't want to be notified about that upgrade anymore.
