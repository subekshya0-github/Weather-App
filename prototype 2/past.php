<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "weather";

// Get the city parameter from the query string
$cityParam = $_GET['city'];

// Creating a database connection
$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Sanitize the user input
$cityParam = $conn->real_escape_string($cityParam);

// Query the database for past weather data for the specified city
$sql = "SELECT * FROM subu_data WHERE city = '$cityParam' AND DATE(date) < CURDATE() ORDER BY date DESC";
$result = $conn->query($sql);

if ($result === false) {
    die("Query error: " . $conn->error);
}

if ($result->num_rows > 0) {
    // Fetch all the data into an array
    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = [
            'city' => $row['city'],
            'temperature' => $row['temperature'],
            'humidity' => $row['humidity'],
            'pressure' => $row['pressure'],
            'wind' => $row['wind'],
            'description' => $row['description'],
            'date' => $row['date']
        ];
    }
    // Send the data as JSON response
    header('Content-Type: application/json');
    echo json_encode($data);
} else {
    echo "No past weather data available for $cityParam";
}

// Close the database connection
$conn->close();
?>