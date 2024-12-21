import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Spinner from "@/components/Spinner";
import { ReactSortable } from "react-sortablejs";

export default function ProductForm({
  _id,
  title: existingTitle,
  description: existingDescription,
  price: existingPrice,
  images: existingImages,
  category: assignedCategory,
  properties: assignedProperties,
  discountPrice: existingDiscountPrice,
  unitType: existingUnitType,
}) {
  const [title, setTitle] = useState(existingTitle || '');
  const [description, setDescription] = useState(existingDescription || '');
  const [category, setCategory] = useState(assignedCategory || '');
  const [productProperties, setProductProperties] = useState(assignedProperties || {});
  const [price, setPrice] = useState(existingPrice || '');
  const [images, setImages] = useState(existingImages || []);
  const [goToProducts, setGoToProducts] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [discountPrice, setDiscountPrice] = useState(existingDiscountPrice || '');
  const [unitType, setUnitType] = useState(existingUnitType || '');
  const [unitValue, setUnitValue] = useState('');
  const router = useRouter();

  useEffect(() => {
    setCategoriesLoading(true);
    axios.get('/api/categories').then(result => {
      setCategories(result.data);
      setCategoriesLoading(false);
    })
  }, []);

  async function saveProduct(ev) {
    ev.preventDefault();
    const data = {
      title,
      description,
      price,
      discountPrice,
      images,
      category,
      properties: productProperties,
      unit: { type: unitType, value: unitValue }, // Ensure this is properly structured
    };
    
    if (_id) {
      await axios.put('/api/products', { ...data, _id });
    } else {
      await axios.post('/api/products', data);
    }
    setGoToProducts(true);
  }

  if (goToProducts) {
    router.push('/products');
  }

  async function uploadImages(ev) {
    const files = ev.target?.files;
    if (files?.length > 0) {
      setIsUploading(true);
      const data = new FormData();
      for (const file of files) {
        data.append('file', file);
      }
      const res = await axios.post('/api/upload', data);
      setImages(oldImages => [...oldImages, ...res.data.links]);
      setIsUploading(false);
    }
  }

  function updateImagesOrder(images) {
    setImages(images);
  }

  function setProductProp(propName, value) {
    setProductProperties(prev => {
      const newProductProps = { ...prev };
      newProductProps[propName] = value;
      return newProductProps;
    });
  }

  const propertiesToFill = [];
  if (categories.length > 0 && category) {
    let catInfo = categories.find(({ _id }) => _id === category);

    if (catInfo) {
      propertiesToFill.push(...catInfo.properties);

      while (catInfo?.parent?._id) {
        const parentCat = categories.find(({ _id }) => _id === catInfo.parent._id);
        if (!parentCat) break;
        propertiesToFill.push(...parentCat.properties);
        catInfo = parentCat;
      }
    }
  }

  return (
    <form onSubmit={saveProduct}>
      <label>Product name</label>
      <input
        type="text"
        placeholder="product name"
        value={title}
        onChange={ev => setTitle(ev.target.value)} />

      <label>Category</label>
      <select value={category} onChange={ev => setCategory(ev.target.value)}>
        <option value="">Uncategorized</option>
        {categories.length > 0 && categories.map(c => (
          <option value={c._id} key={c._id}>{c.name}</option>
        ))}
      </select>
      {categoriesLoading && (<Spinner />)}

      {propertiesToFill.length > 0 && propertiesToFill.map((p, index) => (
        <div key={index}>
          <label>{p.name[0].toUpperCase() + p.name.substring(1)}</label>
          <div>
            <select
              value={productProperties[p.name]}
              onChange={ev => setProductProp(p.name, ev.target.value)}>
              {p.values.map((v, idx) => (
                <option key={idx} value={v}>{v}</option>
              ))}
            </select>
          </div>
        </div>
      ))}

      <label>Photos</label>
      <div className="mb-2 flex flex-wrap gap-1">
        <ReactSortable
          list={images}
          className="flex flex-wrap gap-1"
          setList={updateImagesOrder}>
          {!!images?.length && images.map(link => (
            <div key={link} className="h-24 bg-white p-4 shadow-sm rounded-sm border border-gray-200">
              <img src={link} alt="" className="rounded-lg" />
            </div>
          ))}
        </ReactSortable>
        {isUploading && (<div className="h-24 flex items-center"><Spinner /></div>)}
        <label className="w-24 h-24 cursor-pointer text-center flex flex-col items-center justify-center text-sm gap-1 text-primary rounded-sm bg-white shadow-sm border border-primary">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          <div>Add image</div>
          <input type="file" onChange={uploadImages} className="hidden" />
        </label>
      </div>

      <label>Description</label>
      <textarea
        placeholder="description"
        value={description}
        onChange={ev => setDescription(ev.target.value)} />
       
       <label>Unit</label>
      <div className="flex flex-col gap-2">
        <select
          value={unitType}
          onChange={ev => setUnitType(ev.target.value)}
        >
          <option value="">Select unit type</option>
          <option value="kg">Kilograms</option>
          <option value="g">Grams</option>
          <option value="l">Liters</option>
          <option value="ml">Milliliters</option>
        </select>
        {unitType && (
          <input
            type="number"
            placeholder={`Enter value in ${unitType}`}
            value={unitValue}
            onChange={ev => setUnitValue(ev.target.value)}
          />
        )}
      </div>


      <label>Price (in EUR)</label>
      <input
        type="number"
        placeholder="price"
        value={price}
        onChange={ev => setPrice(ev.target.value)} />

      <label>Discount Price (in EURO)</label>
      <input
        type="number"
        placeholder="discount price"
        value={discountPrice}
        onChange={ev => setDiscountPrice(ev.target.value)} />

      <button type="submit" className="btn-primary">
        Save
      </button>
    </form>
  );
}
