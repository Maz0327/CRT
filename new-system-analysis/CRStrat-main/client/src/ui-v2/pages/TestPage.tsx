export default function TestPage() {
  return (
    <div style={{ 
      backgroundColor: 'white', 
      color: 'black', 
      padding: '20px',
      minHeight: '100vh',
      fontSize: '18px'
    }}>
      <h1 style={{ color: 'red', fontSize: '24px' }}>TEST PAGE LOADING</h1>
      <p>If you can see this, React is working!</p>
      <div style={{ border: '2px solid blue', padding: '10px', margin: '10px 0' }}>
        This is a test component with inline styles.
      </div>
      <button 
        style={{ 
          backgroundColor: 'green', 
          color: 'white', 
          padding: '10px 20px', 
          border: 'none',
          fontSize: '16px'
        }}
        onClick={() => alert('Button clicked!')}
      >
        Test Button
      </button>
    </div>
  );
}