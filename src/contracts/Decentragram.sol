pragma solidity ^0.5.0;

contract Decentragram {
    string public name = "Decentragram";
    //Store images
    uint256 public imageCount = 0;
    mapping(uint256 => Image) public images;
    struct Image {
        uint256 id;
        string hash;
        string description;
        uint256 tipAmount;
        address payable author;
    }

    event ImageTipped(
        uint256 id,
        string hash,
        string description,
        uint256 tipAmount,
        address payable author
    );

    event ImageCreated(
        uint256 id,
        string hash,
        string description,
        uint256 tipAmount,
        address payable author
    );

    // Create images
    function uploadImage(string memory _imgHash, string memory _description)
        public
    {
        // Make sure the image hash exists
        require(bytes(_imgHash).length > 0);

        // Make sure the image description exists
        require(bytes(_description).length > 0);

        // Make sure uploader address exists
        require(msg.sender != address(0x0));

        // Increment image id
        imageCount++;
        // Add image to contract
        images[imageCount] = Image(
            imageCount,
            _imgHash,
            _description,
            0,
            msg.sender
        );
        // Trigger an event
        emit ImageCreated(imageCount, _imgHash, _description, 0, msg.sender);
    }

    // Tip images
    function tipImageOwner(uint256 _id) public payable {
        // Make sure the id valid
        require(_id > 0 && _id <= imageCount);
        //Fetch the image
        Image memory _image = images[_id];
        //Fetch the author
        address payable _author = _image.author;
        //Pay the author by sending them Ether
        address(_author).transfer(msg.value);
        _image.tipAmount += msg.value;
        images[_id] = _image;
        emit ImageTipped(
            imageCount,
            _image.hash,
            _image.description,
            _image.tipAmount,
            _image.author
        );
    }
}
