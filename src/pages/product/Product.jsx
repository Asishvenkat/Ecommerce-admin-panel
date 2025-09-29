import "./product.css";
import Chart from "../../components/chart/Chart";
import PublishIcon from "@mui/icons-material/Publish";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { userRequest } from "../../requestMethods";
import { storage, ID } from "../../appwrite";
import { 
  updateProductStart, 
  updateProductSuccess, 
  updateProductFailure 
} from "../../redux/productRedux";

export default function Product() {
  const location = useLocation();
  const productId = location.pathname.split("/")[2];
  const dispatch = useDispatch();
  
  const [pStats, setPStats] = useState([]);
  const [inputs, setInputs] = useState({});
  const [file, setFile] = useState(null);
  const [cat, setCat] = useState([]);
  const [size, setSize] = useState([]);
  const [color, setColor] = useState([]);

  const product = useSelector((state) =>
    state.product.products.find((product) => product._id === productId)
  );
  
  const { isFetching } = useSelector((state) => state.product);

  const currentUser = useSelector((state) => state.user.currentUser);
  
 
  const isGuestMode = () => {
    try {
     
      if (currentUser && currentUser.isAdmin) {
        return false;
      }
      
    
      const guestUser = localStorage.getItem('guestUser');
      return guestUser !== null;
    } catch {
      return false;
    }
  };

  const MONTHS = useMemo(
    () => [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Agu",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    []
  );

  useEffect(() => {
    if (product) {
      setInputs({
        title: product.title || '',
        desc: product.desc || '',
        price: product.price || '',
        inStock: product.inStock || true
      });
      setCat(product.categories || []);
      setSize(product.size || []);
      setColor(product.color || []);
    }
  }, [product]);

  useEffect(() => {
    const getStats = async () => {
      try {
        const res = await userRequest.get("orders/income?pid=" + productId);
        const list = res.data.sort((a, b) => a._id - b._id);
        
        // Reset stats and create new array to prevent duplicates
        const newStats = list.map((item) => ({
          name: MONTHS[item._id - 1],
          Sales: item.total
        }));
        
        setPStats(newStats);
      } catch (err) {
        console.log(err);
      }
    };
    getStats();
  }, [productId, MONTHS]);

 
  const handleChange = (e) => {
    setInputs((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleCat = (e) => setCat(e.target.value.split(","));
  const handleSize = (e) => setSize(e.target.value.split(","));
  const handleColor = (e) => setColor(e.target.value.split(","));


  const handleUpdate = async (e) => {
    e.preventDefault();
   
    if (isGuestMode()) {
      alert("⚠️ Guest Mode: Changes cannot be saved in guest mode. This is a demo version only.");
      return;
    }
    
    dispatch(updateProductStart());

    try {
      let imageUrl = product.img; 

      
      if (file) {
        const uploadedFile = await storage.createFile(
          "684d5b6500217dc48597", 
          ID.unique(),
          file
        );

        imageUrl = `https://cloud.appwrite.io/v1/storage/buckets/684d5b6500217dc48597/files/${uploadedFile.$id}/view?project=684d5add003ce6bd9cb0`;
      }

      
      const updatedProductData = {
        ...inputs,
        img: imageUrl,
        categories: cat,
        size: size,
        color: color,
      };

      
      const res = await userRequest.put(`/products/${productId}`, updatedProductData);
      
      
      dispatch(updateProductSuccess({ 
        id: productId, 
        product: res.data 
      }));
      
      console.log("✅ Product updated:", res.data);
      alert("Product updated successfully!");
      
    } catch (err) {
      dispatch(updateProductFailure());
      console.error("❌ Update failed:", err.response?.data || err);
      alert("Failed to update product. Please try again.");
    }
  };

  if (!product) {
    return <div>Loading...</div>;
  }

  return (
    <div className="product">
      <div className="productTitleContainer">
        <h1 className="productTitle">Product</h1>
        <Link to="/newproduct">
          <button className="productAddButton">Create</button>
        </Link>
      </div>
      
      {isGuestMode() && (
        <div style={{
          backgroundColor: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: '4px',
          padding: '10px 15px',
          margin: '10px 0',
          color: '#856404'
        }}>
          <strong>⚠️ Guest Mode:</strong> You are viewing in demo mode. Any changes made will not be saved.
        </div>
      )}
      
      <div className="productTop">
        <div className="productTopLeft">
          <Chart data={pStats} dataKey="Sales" title="Sales Performance" />
        </div>
        <div className="productTopRight">
          <div className="productInfoTop">
            <img src={product.img} alt="" className="productInfoImg" />
            <span className="productName">{product.title}</span>
          </div>
          <div className="productInfoBottom">
            <div className="productInfoItem">
              <span className="productInfoKey">id:</span>
              <span className="productInfoValue">{product._id}</span>
            </div>
            <div className="productInfoItem">
              <span className="productInfoKey">sales:</span>
              <span className="productInfoValue">5123</span>
            </div>
            <div className="productInfoItem">
              <span className="productInfoKey">in stock:</span>
              <span className="productInfoValue">{product.inStock ? "Yes" : "No"}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="productBottom">
        <form className="productForm">
          <div className="productFormLeft">
            <label>Product Name</label>
            <input 
              name="title"
              type="text" 
              value={inputs.title || ''}
              onChange={handleChange}
            />
            
            <label>Product Description</label>
            <input 
              name="desc"
              type="text" 
              value={inputs.desc || ''}
              onChange={handleChange}
            />
            
            <label>Price</label>
            <input 
              name="price"
              type="number" 
              value={inputs.price || ''}
              onChange={handleChange}
            />
            
            <label>Categories</label>
            <input 
              type="text" 
              placeholder="jeans,skirts" 
              value={cat.join(',')}
              onChange={handleCat}
            />
            
            <label>Size</label>
            <input 
              type="text" 
              placeholder="S,M,L" 
              value={size.join(',')}
              onChange={handleSize}
            />
            
            <label>Color</label>
            <input 
              type="text" 
              placeholder="red,blue" 
              value={color.join(',')}
              onChange={handleColor}
            />
            
            <label>In Stock</label>
            <select 
              name="inStock" 
              value={inputs.inStock}
              onChange={handleChange}
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
          <div className="productFormRight">
            <div className="productUpload">
              <img 
                src={file ? URL.createObjectURL(file) : product.img} 
                alt="" 
                className="productUploadImg" 
              />
              <label htmlFor="file">
                <PublishIcon />
              </label>
              <input 
                type="file" 
                id="file" 
                style={{ display: "none" }}
                onChange={(e) => setFile(e.target.files[0])}
                disabled={isGuestMode()}
              />
            </div>
            <button 
              className="productButton" 
              onClick={handleUpdate}
              type="button"
              disabled={isFetching || isGuestMode()}
              style={{
                opacity: isGuestMode() ? 0.6 : 1,
                cursor: isGuestMode() ? 'not-allowed' : 'pointer'
              }}
            >
              {isFetching ? "Updating..." : isGuestMode() ? "Update" : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}