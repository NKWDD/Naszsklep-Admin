import Layout from "@/components/Layout";
import {useRouter} from "next/router";
import {useEffect, useState} from "react";
import axios from "axios";
import ProductForm from "@/components/ProductForm";

export default function EditProductPage() {
  const [productInfo, setProductInfo] = useState(null);
  const router = useRouter();
  const {id} = router.query;
  useEffect(() => {
    if (!id) {
      return;
    }
    axios.get('/api/products?id='+id).then(response => {
      setProductInfo(response.data);
    });
  }, [id]);
  return (
    <Layout>
      <div class="space-y-4">
<ul class="flex items-center space-x-2 text-sm text-gray-600">
  <li>
    <a href="http://localhost:3000/" class="text-primary hover:text-primaryhover font-medium">Dashboard</a>
  </li>
  <li>
    <span class="text-gray-400">/</span>
  </li>
  <li>
    <a href="http://localhost:3000/products" class="text-primary hover:text-primaryhover font-medium">Products</a>
  </li>
  <li>
    <span class="text-gray-400">/</span>
  </li>
  <li>
    <a href="#" class="text-gray-500 font-medium cursor-default">Edit Product</a>
  </li>
</ul>
</div>

      {productInfo && (
        <ProductForm {...productInfo} />
      )}
    </Layout>
  );
}