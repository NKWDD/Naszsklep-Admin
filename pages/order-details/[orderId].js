import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Layout from '@/components/Layout';
import Spinner from '@/components/Spinner';

export default function OrderDetailsPage() {
  const { query, isReady } = useRouter(); 
  const { orderId } = query;

  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isReady && orderId) {
      setIsLoading(true);
      axios
        .get(`/api/orders/${orderId}`)
        .then(response => {
          setOrder(response.data);
          setIsLoading(false);
        })
        .catch(error => {
          setIsLoading(false);
          console.error('Error fetching order details:', error);
        });
    }
  }, [isReady, orderId]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          <Spinner fullWidth={true} />
        </div>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout>
        <div className="text-center py-10">
          <h1 className="text-xl font-semibold text-red-600">Order not found</h1>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-semibold text-gray-800 mb-6">Order Details</h1>

        <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Order Information</h2>
          <p className="text-lg text-gray-600"><strong>Order ID:</strong> {order._id}</p>
          <p className="text-lg text-gray-600"><strong>Customer:</strong> {order.name} ({order.email})</p>
          <p className="text-lg text-gray-600">
            <strong>Address:</strong> {order.streetAddress}, {order.city}, {order.country}
          </p>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Products</h2>
          {order.line_items.length > 0 ? (
            <ul className="space-y-4">
              {order.line_items.map((item, index) => (
                <li key={index} className="flex justify-between items-center">
                  <span className="text-lg text-gray-800">{item.price_data?.product_data.name}</span>
                  <span className="text-lg text-gray-600">x{item.quantity}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-lg text-gray-600">No products found in this order.</p>
          )}
        </div>
      </div>
    </Layout>
  );
}
