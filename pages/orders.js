import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";  // Link component from Next.js for navigation
import Layout from "@/components/Layout";
import Spinner from "@/components/Spinner";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);  // Track the current page
  const [hasMore, setHasMore] = useState(true);  // Flag to track if there are more orders

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`/api/orders?page=${page}&limit=10`);
        setOrders(prevOrders => [...prevOrders, ...response.data.orders]);
        setHasMore(response.data.hasMore);  // Set whether there are more orders to load
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [page]);

  const loadMoreOrders = () => {
    setPage(prevPage => prevPage + 1);  // Increment the page to load more orders
  };

  return (
    <Layout>
      <h1>Orders</h1>
      <table className="basic">
        <thead>
          <tr>
            <th>Date</th>
            <th>Paid</th>
            <th>Recipient</th>
            <th>Products</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {isLoading && (
            <tr>
              <td colSpan={5}>
                <div className="py-4">
                  <Spinner fullWidth={true} />
                </div>
              </td>
            </tr>
          )}
          {orders.length > 0 && orders.map(order => (
            <tr key={order._id}>  {/* Use _id instead of id */}
              <td>{(new Date(order.createdAt)).toLocaleString()}</td>
              <td className={order.paid ? 'text-green-600' : 'text-red-600'}>
                {order.paid ? 'YES' : 'NO'}
              </td>
              <td>
                {order.name} {order.email}<br />
                {order.phone}<br />
                {order.city} {order.postalCode} {order.country}<br />
                {order.streetAddress}
              </td>
              <td>
                {order.line_items.length} items
              </td>
              <td>
                <Link href={`/order-details/${order._id}`}>  {/* Correct link using _id */}
                  <button>View Details</button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Load More Button */}
      {hasMore && !isLoading && (
        <div className="mt-4 text-center">
          <button
            className="btn btn-primary"
            onClick={loadMoreOrders}
          >
            Load More Orders
          </button>
        </div>
      )}
    </Layout>
  );
}
