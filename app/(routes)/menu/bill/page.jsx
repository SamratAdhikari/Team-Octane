"use client";

import React, { useState, useEffect } from "react";
import { Typography, Button, Card, CardContent, Skeleton } from "@mui/material";
import BillQR from "./_components/BillQR"; // Assuming BillQRDialog component is in _components folder
import { Rupee } from "@/app/constants/Symbols";

const Bill = () => {
    const [bill, setBill] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [openBillQR, setOpenBillQR] = useState(false); // Manage BillQRDialog visibility

    const tableName = "Table01";

    const fetchBill = async () => {
        try {
            const response = await fetch(`/api/order`);
            const data = await response.json();

            console.log("Fetched Orders:", data);

            if (response.ok) {
                const tableOrders = data.filter(
                    (order) => order.table === tableName
                );

                console.log("Filtered Orders for Table 01:", tableOrders);

                if (tableOrders.length === 0) {
                    setError(`No bill found for the table: ${tableName}`);
                } else {
                    setBill(tableOrders);
                }
            } else {
                setError(data.error || "Failed to fetch bill.");
            }
        } catch (error) {
            setError("An error occurred while fetching the bill.");
            console.error("Error in fetchBill:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBill();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center w-full justify-center mt-4">
                <Typography variant="h4" sx={{ mb: 4 }} className="text-center">
                    Bill for Table 01
                </Typography>
                {[...Array(3)].map((_, idx) => (
                    <Skeleton
                        key={idx}
                        variant="rectangular"
                        width="60%"
                        height={150}
                        sx={{ mb: 2 }}
                    />
                ))}
                <Skeleton
                    variant="rectangular"
                    width="60%"
                    height={50}
                    sx={{ mb: 2 }}
                />
            </div>
        );
    }

    // Calculate overall total
    const overallTotal = bill.reduce((total, tableOrder) => {
        if (Array.isArray(tableOrder.items) && tableOrder.items.length > 0) {
            return (
                total +
                tableOrder.items.reduce((orderTotal, item) => {
                    if (item?.item?.price && item.quantity) {
                        return orderTotal + item.item.price * item.quantity;
                    }
                    return orderTotal;
                }, 0)
            );
        }
        return total;
    }, 0);

    const handleProceedToPayment = () => {
        // Example QR Code Image URL, replace with actual URL or generate QR dynamically
        const qrImageUrl = "https://example.com/qr-code.png";
        setOpenBillQR(true); // Open BillQRDialog
    };

    return (
        <div className="flex flex-col items-center justify-center mt-4">
            {bill.length > 0 ? (
                <>
                    <Typography
                        variant="h4"
                        sx={{ mb: 4 }}
                        className="text-center"
                    >
                        Bill for Table 01
                    </Typography>

                    {/* Render bill cards */}
                    {bill.map((tableOrder, index) => (
                        <Card
                            key={index}
                            className="p-4 w-full sm:w-[95%] md:w-[60%] shadow-lg mb-4"
                        >
                            <CardContent>
                                <Typography
                                    sx={{ mb: 2 }}
                                    className="text-gray-500 text-base"
                                >
                                    Order {index + 1}:
                                </Typography>
                                {Array.isArray(tableOrder.items) &&
                                tableOrder.items.length > 0 ? (
                                    tableOrder.items.map((item, itemIndex) => (
                                        <div
                                            key={itemIndex}
                                            className="flex justify-between"
                                        >
                                            <Typography className="text-gray-800 text-lg">
                                                {item?.item?.name ||
                                                    "Unknown Item"}{" "}
                                                x {item.quantity}
                                            </Typography>
                                            <Typography>
                                                {Rupee}
                                                {item?.item?.price &&
                                                item.quantity
                                                    ? item.item.price *
                                                      item.quantity
                                                    : 0}
                                            </Typography>
                                        </div>
                                    ))
                                ) : (
                                    <Typography>
                                        No items in this order.
                                    </Typography>
                                )}
                            </CardContent>
                        </Card>
                    ))}

                    {/* Overall total at the bottom */}
                    <Typography
                        variant="h6"
                        sx={{ mt: 4, fontWeight: "bold" }}
                        className="flex justify-between w-full sm:w-[95%] md:w-[60%] shadow-lg p-4"
                    >
                        <span>Total:</span>
                        <span>
                            {Rupee}
                            {overallTotal}
                        </span>
                    </Typography>

                    <Button
                        variant="contained"
                        color="primary"
                        className="mt-4 w-full sm:w-[95%] md:w-[60%] mb-4 bg-blue-950 py-2"
                        onClick={handleProceedToPayment}
                    >
                        Proceed to Payment
                    </Button>
                </>
            ) : (
                <div className="flex flex-col font-normal text-xl">
                    No bills available for {tableName}.
                </div>
            )}

            {/* BillQR Dialog */}
            <BillQR
                open={openBillQR}
                onClose={() => setOpenBillQR(false)} // Close dialog on close button click
                billData={{
                    totalAmount: overallTotal,
                    qrImageUrl: "https://example.com/qr-code.png", // Replace with actual QR image URL
                }}
            />
        </div>
    );
};

export default Bill;
