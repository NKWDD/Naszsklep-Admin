import Layout from "@/components/Layout";
import {useEffect, useState} from "react";
import axios from "axios";
import Spinner from "@/components/Spinner";
import {withSwal} from "react-sweetalert2";

function SettingsPage({swal}) {
  const [products, setProducts] = useState([]);
  const [featuredProductIds, setFeaturedProductIds] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [shippingFee, setShippingFee] = useState('');

  useEffect(() => {
    setIsLoading(true);
    fetchAll().then(() => {
      setIsLoading(false);
    });
  }, []);

  async function fetchAll() {
    setIsLoading(true);
    try {
      const productsResponse = await axios.get('/api/products', {
        params: { all: true }, // Fetch all products
      });
      console.log("Fetched products:", productsResponse.data); 
      setProducts(productsResponse.data.products || []);
  
      const featuredProductsResponse = await axios.get('/api/settings?name=featuredProductIds');
      console.log("Fetched featured product IDs:", featuredProductsResponse.data);
      setFeaturedProductIds(featuredProductsResponse.data.value || []);
  
      const shippingFeeResponse = await axios.get('/api/settings?name=shippingFee');
      console.log("Fetched shipping fee:", shippingFeeResponse.data);
      setShippingFee(shippingFeeResponse.data.value);
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setIsLoading(false);
    }
  }
  
  function handleProductSelection(ev) {
    const selectedOptions = Array.from(ev.target.selectedOptions, option => option.value);
    setFeaturedProductIds(selectedOptions.slice(0, 5)); // Limit to 5 products
  }

  async function saveSettings() {
    setIsLoading(true);
    await axios.put('/api/settings', {
      name: 'featuredProductIds',
      value: featuredProductIds,
    });
    await axios.put('/api/settings', {
      name: 'shippingFee',
      value: shippingFee,
    });
    setIsLoading(false);
    await swal.fire({
      title: 'Settings saved!',
      icon: 'success',
    });
  }

  return (
    <Layout>
      <h1>Settings</h1>
      {isLoading && (
        <Spinner />
      )}
      {!isLoading && (
        <>
          <label>Featured products (select up to 5)</label>
          <select 
            multiple 
            value={featuredProductIds} 
            onChange={handleProductSelection}
            className="h-40" // Make tall enough to display multiple items
          >
            {products.length > 0 && products.map(product => (
              <option key={product._id} value={product._id}>
                {product.title}
              </option>
            ))}
          </select>
          <p className="text-sm text-gray-500 mt-1">Hold Ctrl (Windows) or Cmd (Mac) to select multiple products</p>
          
          <div className="mt-4">
            <button onClick={saveSettings} className="btn-primary">Save settings</button>
          </div>
        </>
      )}
    </Layout>
  );
}

export default withSwal(({swal}) => (
  <SettingsPage swal={swal} />
));