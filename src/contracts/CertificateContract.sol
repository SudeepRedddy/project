// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CertificateContract {
    address public owner;
    
    struct Certificate {
        string certificateId;
        string studentId;
        string studentName;
        string course;
        string university;
        uint256 timestamp;
        address issuer;
        bool exists;
    }
    
    // Mapping from certificate ID to certificate data
    mapping(string => Certificate) public certificates;
    
    // Event emitted when a new certificate is issued
    event CertificateIssued(
        string indexed certificateId,
        address indexed issuer,
        string studentId,
        string studentName,
        string course,
        string university,
        uint256 timestamp
    );
    
    constructor() {
        owner = msg.sender;
    }
    
    // Function to issue a new certificate
    function issueCertificate(
        string memory certificateId,
        string memory studentId,
        string memory studentName,
        string memory course,
        string memory university
    ) public {
        // Ensure certificate doesn't already exist
        require(!certificates[certificateId].exists, "Certificate with this ID already exists");
        
        // Create new certificate
        Certificate memory newCertificate = Certificate({
            certificateId: certificateId,
            studentId: studentId,
            studentName: studentName,
            course: course,
            university: university,
            timestamp: block.timestamp,
            issuer: msg.sender,
            exists: true
        });
        
        // Store certificate
        certificates[certificateId] = newCertificate;
        
        // Emit event
        emit CertificateIssued(
            certificateId,
            msg.sender,
            studentId,
            studentName,
            course,
            university,
            block.timestamp
        );
    }
    
    // Function to check if a certificate is valid
    function isCertificateValid(string memory certificateId) public view returns (bool) {
        return certificates[certificateId].exists;
    }
    
    // Function to get certificate details
    function getCertificate(string memory certificateId) public view returns (Certificate memory) {
        require(certificates[certificateId].exists, "Certificate does not exist");
        return certificates[certificateId];
    }
}