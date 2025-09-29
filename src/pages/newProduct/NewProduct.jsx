import { useState } from "react";
import { useSelector } from "react-redux";
import "./newProduct.css";
import { userRequest } from "../../requestMethods";
import { storage, ID } from "../../appwrite";

export default function NewProduct() {
  const [inputs, setInputs] = useState({});
  const [file, setFile] = useState(null);
  const [cat, setCat] = useState([]);
  const [size, setSize] = useState([]);
  const [color, setColor] = useState([]);

  
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

  const handleChange = (e) => {
    setInputs((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleCat = (e) => setCat(e.target.value.split(","));
  const handleSize = (e) => setSize(e.target.value.split(","));
  const handleColor = (e) => setColor(e.target.value.split(","));

  const handleClick = async (e) => {
    e.preventDefault();

    // Block guest users from creating
    if (isGuestMode()) {
      alert("⚠️ Guest Mode: You cannot create products in guest mode. This is a demo version only.");
      return;
    }

    try {
      const uploadedFile = await storage.createFile(
        "684d5b6500217dc48597", // Your Bucket ID
        ID.unique(),
        file
      );

      const imageUrl = `https://cloud.appwrite.io/v1/storage/buckets/684d5b6500217dc48597/files/${uploadedFile.$id}/view?project=684d5add003ce6bd9cb0`;

      const product = {
        ...inputs,
        img: imageUrl,
        categories: cat,
        size: size,
        color: color,
      };

      const res = await userRequest.post("/products", product);
      console.log("✅ Product created:", res.data);
      alert("Product created successfully!");
    } catch (err) {
      console.error("❌ Upload or product creation failed:", err.response?.data || err);
      alert("Failed to create product. Please try again.");
    }
  };

  return (
    <div className="newProduct">
      <h1 className="addProductTitle">New Product</h1>

      {/* Guest Mode Warning */}
      {isGuestMode() && (
        <div style={{
          backgroundColor: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: '4px',
          padding: '10px 15px',
          margin: '10px 0',
          color: '#856404'
        }}>
          <strong>⚠️ Guest Mode:</strong> You are viewing in demo mode. You cannot create products.
        </div>
      )}

      <form className="addProductForm">
        <div className="addProductItem">
          <label>Image</label>
          <input 
            type="file" 
            onChange={(e) => setFile(e.target.files[0])} 
          />
        </div>
        <div className="addProductItem">
          <label>Title</label>
          <input name="title" type="text" onChange={handleChange} />
        </div>
        <div className="addProductItem">
          <label>Description</label>
          <input name="desc" type="text" onChange={handleChange} />
        </div>
        <div className="addProductItem">
          <label>Price</label>
          <input name="price" type="number" onChange={handleChange} />
        </div>
        <div className="addProductItem">
          <label>Categories</label>
          <input type="text" placeholder="jeans,skirts" onChange={handleCat} />
        </div>
        <div className="addProductItem">
          <label>Size</label>
          <input type="text" placeholder="S,M,L" onChange={handleSize} />
        </div>
        <div className="addProductItem">
          <label>Color</label>
          <input type="text" placeholder="red,blue" onChange={handleColor} />
        </div>
        <div className="addProductItem">
          <label>Stock</label>
          <select name="inStock" onChange={handleChange}>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>

        <button 
          className="addProductButton" 
          onClick={handleClick}
          disabled={isGuestMode()}
          style={{
            opacity: isGuestMode() ? 0.6 : 1,
            cursor: isGuestMode() ? "not-allowed" : "pointer"
          }}
        >
          Create
        </button>
      </form>
    </div>
  );
}
