import { useEffect, useState } from "react";
import axios from "axios";
import Spinner from "@/components/Spinner";
import { subHours } from "date-fns";

export default function HomeStats() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    axios
      .get('/api/orders?page=1&limit=10000') // Adjusted to include pagination parameters
      .then(res => {
        console.log(res.data);  // Debugging line to inspect the response
        setOrders(res.data.orders || []);  // Ensure the response is handled correctly
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Error fetching orders:", error);
        setIsLoading(false);
      });
  }, []);

  function ordersTotal(orders) {
    let sum = 0;
    orders.forEach(order => {
      const { line_items } = order;
      line_items.forEach(li => {
        const lineSum = li.quantity * li.price_data.unit_amount / 100;
        sum += lineSum;
      });
    });
    console.log({ orders });  // Debugging line to check the orders data
    return new Intl.NumberFormat('sv-SE').format(sum);
  }

  // Ensure orders is an array before filtering
  const ordersToday = Array.isArray(orders) ? orders.filter(o => o.createdAt && new Date(o.createdAt) > subHours(new Date(), 24)) : [];
  const ordersWeek = Array.isArray(orders) ? orders.filter(o => o.createdAt && new Date(o.createdAt) > subHours(new Date(), 24 * 7)) : [];
  const ordersMonth = Array.isArray(orders) ? orders.filter(o => o.createdAt && new Date(o.createdAt) > subHours(new Date(), 24 * 30)) : [];

  if (isLoading) {
    return (
      <div className="my-4">
        <Spinner fullWidth={true} />
      </div>
    );
  }

  return (
    <div>
      <h2>Orders</h2>
      <div className="tiles-grid">
        <div className="tile">
          <h3 className="tile-header">Today</h3>
          <div className="tile-number">{ordersToday.length}</div>
          <div className="tile-desc">{ordersToday.length} orders today</div>
        </div>
        <div className="tile">
          <h3 className="tile-header">This week</h3>
          <div className="tile-number">{ordersWeek.length}</div>
          <div className="tile-desc">{ordersWeek.length} orders this week</div>
        </div>
        <div className="tile">
          <h3 className="tile-header">This month</h3>
          <div className="tile-number">{ordersMonth.length}</div>
          <div className="tile-desc">{ordersMonth.length} orders this month</div>
        </div>
      </div>
      <h2>Revenue</h2>
      <div className="tiles-grid">
        <div className="tile">
          <h3 className="tile-header">Today</h3>
          <div className="tile-number">$ {ordersTotal(ordersToday)}</div>
          <div className="tile-desc">{ordersToday.length} orders today</div>
        </div>
        <div className="tile">
          <h3 className="tile-header">This week</h3>
          <div className="tile-number">$ {ordersTotal(ordersWeek)}</div>
          <div className="tile-desc">{ordersWeek.length} orders this week</div>
        </div>
        <div className="tile">
          <h3 className="tile-header">This month</h3>
          <div className="tile-number">$ {ordersTotal(ordersMonth)}</div>
          <div className="tile-desc">{ordersMonth.length} orders this month</div>
        </div>
      </div>
    </div>
  );
}
