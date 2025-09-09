<?php
header('Content-Type: application/json');

$productDir = '../img/product/';
$images = [];

if (is_dir($productDir)) {
    $files = scandir($productDir);
    foreach ($files as $file) {
        if ($file != '.' && $file != '..' && preg_match('/\.(jpg|jpeg|png|gif|webp)$/i', $file)) {
            $images[] = [
                'filename' => $file,
                'path' => 'img/product/' . $file,
                'size' => filesize($productDir . $file),
                'modified' => filemtime($productDir . $file)
            ];
        }
    }
}

echo json_encode([
    'success' => true,
    'images' => $images,
    'count' => count($images)
]);
?>
