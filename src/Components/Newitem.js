import React from 'react';
function Newitem(props) {
  const { title, description, imageUrl, url } = props;

  return (
    <div className="card">
      <img
        src={imageUrl || 'https://placehold.co/?text=News+Image'}
        className="card-img-top"
        alt={`Title for ${title}`}
      />
      <div className="card-body">
        <h5 className="card-title">{title}</h5>
        <p className="card-text">{description || 'No description available'}</p>
        <a href={url} target="_blank" rel="noreferrer" className="btn btn-sm btn-primary">
          Read more
        </a>
      </div>
    </div>
  );
}

export default Newitem;