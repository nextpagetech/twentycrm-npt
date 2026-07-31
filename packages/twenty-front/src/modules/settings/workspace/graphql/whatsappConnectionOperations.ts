import { gql } from '@apollo/client';

export const GetWhatsAppConnectionsDocument = gql`
  query GetWhatsAppConnections {
    whatsAppConnections {
      id
      name
      phoneNumberId
      whatsAppBusinessAccountId
      displayPhoneNumber
      apiVersion
      status
      lastValidatedAt
      authFailedAt
      createdAt
      updatedAt
    }
  }
`;

export const CreateWhatsAppConnectionDocument = gql`
  mutation CreateWhatsAppConnection($input: CreateWhatsAppConnectionInput!) {
    createWhatsAppConnection(input: $input) {
      id
      name
      phoneNumberId
      whatsAppBusinessAccountId
      displayPhoneNumber
      apiVersion
      status
      lastValidatedAt
      authFailedAt
      createdAt
      updatedAt
    }
  }
`;

export const UpdateWhatsAppConnectionDocument = gql`
  mutation UpdateWhatsAppConnection($input: UpdateWhatsAppConnectionInput!) {
    updateWhatsAppConnection(input: $input) {
      id
      name
      phoneNumberId
      whatsAppBusinessAccountId
      displayPhoneNumber
      apiVersion
      status
      lastValidatedAt
      authFailedAt
      createdAt
      updatedAt
    }
  }
`;

export const ValidateWhatsAppConnectionDocument = gql`
  mutation ValidateWhatsAppConnection($id: UUID!) {
    validateWhatsAppConnection(id: $id) {
      id
      name
      phoneNumberId
      whatsAppBusinessAccountId
      displayPhoneNumber
      apiVersion
      status
      lastValidatedAt
      authFailedAt
      createdAt
      updatedAt
    }
  }
`;

export const ArchiveWhatsAppConnectionDocument = gql`
  mutation ArchiveWhatsAppConnection($id: UUID!) {
    archiveWhatsAppConnection(id: $id) {
      id
      archivedAt
    }
  }
`;
