<?php
// Test payment processing endpoint
echo "💰 Testing Payment Processing Endpoint\n";

$paymentData = [
    'student_id' => 1,
    'payment_items' => [
        [
            'student_payment_due_id' => 1,
            'payment_type_id' => 1,
            'amount' => 5000.00
        ],
        [
            'student_payment_due_id' => 2,
            'payment_type_id' => 2,
            'amount' => 1500.00
        ]
    ],
    'total_amount' => 6500.00,
    'payment_method' => 'Cash',
    'notes' => 'Test payment'
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://localhost:8080/api/payments');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($paymentData));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

echo "HTTP Code: $httpCode\n";
echo "Response: $response\n";
if ($error) {
    echo "cURL Error: $error\n";
}
?>
