# PHP Registration App

This project is a simple PHP registration application that allows users to register with a username and password. It connects to a MongoDB database to store user information.

## Project Structure

```
php-registration-app
├── public
│   ├── components
│   │   └── registration.php      # HTML structure for the registration form
│   ├── assets
│   │   └── css
│   │       └── registration.css   # CSS styles for the registration form
├── src
│   └── db
│       └── mongodb_connect.php     # PHP script to connect to MongoDB
├── composer.json                   # Composer configuration file
└── README.md                       # Project documentation
```

## Requirements

- PHP 7.0 or higher
- Composer
- MongoDB PHP Library

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd php-registration-app
   ```

2. Install dependencies using Composer:
   ```
   composer install
   ```

3. Set up your MongoDB database and update the connection details in `src/db/mongodb_connect.php`.

## Usage

- Open `public/components/registration.php` in your web browser to access the registration form.
- Fill in the username and password fields and click the "Register" button to submit your information.

## License

This project is licensed under the MIT License.