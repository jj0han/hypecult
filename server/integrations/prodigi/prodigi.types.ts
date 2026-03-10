export type ProdigiShippingMethod =
  | "Budget"
  | "Standard"
  | "StandardPlus"
  | "Express"
  | "Overnight"
  | string;

export type ProdigiSizing =
  | "fillPrintArea"
  | "fitPrintArea"
  | "stretchToPrintArea"
  | string;

export type ProdigiStatusStage =
  | "InProgress"
  | "Complete"
  | "Cancelled"
  | string;
export type ProdigiStatusDetailState =
  | "NotStarted"
  | "InProgress"
  | "Complete"
  | "Error"
  | string;
export type ProdigiShipmentStatus =
  | "Processing"
  | "Cancelled"
  | "Shipped"
  | string;
export type ProdigiOrderItemStatus =
  | "Ok"
  | "Invalid"
  | "NotYetDownloaded"
  | string;
export type ProdigiAssetStatus = "Complete" | "InProgress" | "Error" | string;

export type ProdigiAttributes = Record<
  string,
  string | number | boolean | null
>;
export type ProdigiMetadata = Record<string, unknown> | null;

export type ProdigiError = {
  statusText: string;
  statusCode: number;
  data: Record<string, unknown>;
  traceParent: string;
};

export interface ProdigiCost {
  amount: string;
  currency: string;
}

export interface ProdigiAddress {
  line1: string;
  line2?: string | null;
  postalOrZipCode: string;
  countryCode: string;
  townOrCity: string;
  stateOrCounty?: string | null;
}

export interface ProdigiRecipient {
  name: string;
  email?: string | null;
  phoneNumber?: string | null;
  address: ProdigiAddress;
}

export interface ProdigiBrandingAsset {
  url: string;
}

export interface ProdigiBranding {
  postcard?: ProdigiBrandingAsset;
  flyer?: ProdigiBrandingAsset;
  packing_slip_bw?: ProdigiBrandingAsset;
  packing_slip_color?: ProdigiBrandingAsset;
  sticker_exterior_round?: ProdigiBrandingAsset;
  sticker_exterior_rectangle?: ProdigiBrandingAsset;
  sticker_interior_round?: ProdigiBrandingAsset;
  sticker_interior_rectangle?: ProdigiBrandingAsset;
}

export interface ProdigiOrderAsset {
  id?: string;
  printArea: string;
  md5Hash?: string;
  url: string;
  thumbnailUrl?: string;
  pageCount?: number;
  status?: ProdigiAssetStatus;
}

export interface ProdigiOrderItem {
  id?: string;
  status?: ProdigiOrderItemStatus;
  merchantReference?: string;
  sku: string;
  copies: number;
  sizing: ProdigiSizing;
  attributes?: ProdigiAttributes;
  assets: ProdigiOrderAsset[];
  recipientCost?: ProdigiCost;
}

export interface ProdigiChargeItem {
  id: string;
  shipmentId: string | null;
  itemId: string | null;
  cost: ProdigiCost;
}

export interface ProdigiCharge {
  id: string;
  chargeType: string;
  prodigiInvoiceNumber: string | null;
  totalCost: ProdigiCost;
  items: ProdigiChargeItem[];
}

export interface ProdigiCarrier {
  name: string;
  service: string;
}

export interface ProdigiFulfillmentLocation {
  countryCode: string;
  labCode: string;
}

export interface ProdigiTracking {
  url?: string | null;
  number?: string | null;
}

export interface ProdigiShipmentItem {
  itemId: string;
}

export interface ProdigiShipment {
  id: string;
  status: ProdigiShipmentStatus;
  carrier?: ProdigiCarrier;
  dispatchDate?: string;
  items: ProdigiShipmentItem[];
  tracking?: ProdigiTracking;
  fulfillmentLocation?: ProdigiFulfillmentLocation;
}

export interface ProdigiOrderStatusIssueAuthorisationDetails {
  authorisationUrl: string;
  paymentDetails: ProdigiCost;
}

export interface ProdigiOrderStatusIssue {
  objectId?: string;
  errorCode: string;
  description: string;
  authorisationDetails?: ProdigiOrderStatusIssueAuthorisationDetails;
}

export interface ProdigiOrderStatusDetails {
  downloadAssets: ProdigiStatusDetailState;
  printReadyAssetsPrepared: ProdigiStatusDetailState;
  allocateProductionLocation: ProdigiStatusDetailState;
  inProduction: ProdigiStatusDetailState;
  shipping: ProdigiStatusDetailState;
}

export interface ProdigiOrderStatus {
  stage: ProdigiStatusStage;
  issues: ProdigiOrderStatusIssue[];
  details: ProdigiOrderStatusDetails;
}

export interface ProdigiPackingSlip {
  url: string;
  status?: string;
}

export interface ProdigiOrder {
  id: string;
  created: string;
  lastUpdated: string;
  callbackUrl: string | null;
  merchantReference?: string;
  shippingMethod: ProdigiShippingMethod;
  idempotencyKey: string | null;
  status: ProdigiOrderStatus;
  charges: ProdigiCharge[];
  shipments: ProdigiShipment[];
  recipient: ProdigiRecipient;
  branding?: ProdigiBranding;
  items: ProdigiOrderItem[];
  packingSlip?: ProdigiPackingSlip | null;
  metadata?: ProdigiMetadata;
}

export interface ProdigiCreateOrderAsset {
  printArea: string;
  url: string;
  md5Hash?: string;
  pageCount?: number;
}

export interface ProdigiCreateOrderItem {
  merchantReference?: string;
  sku: string;
  copies: number;
  sizing: ProdigiSizing;
  attributes?: ProdigiAttributes;
  recipientCost?: ProdigiCost;
  assets: ProdigiCreateOrderAsset[];
}

export interface ProdigiCreateOrderRequest {
  callbackUrl?: string;
  merchantReference?: string;
  shippingMethod: ProdigiShippingMethod;
  idempotencyKey?: string;
  recipient: ProdigiRecipient;
  branding?: ProdigiBranding;
  items: ProdigiCreateOrderItem[];
  packingSlip?: ProdigiPackingSlip | null;
  metadata?: ProdigiMetadata;
}

export type ProdigiCreateOrderOutcome =
  | "Created"
  | "OnHold"
  | "CreatedWithIssues"
  | "AlreadyExists"
  | string;

export type ProdigiGetOrderOutcome = "Ok" | string;

export interface ProdigiOrderResponse<TOutcome extends string = string> {
  outcome: TOutcome;
  order: ProdigiOrder;
  traceParent?: string;
}

export type ProdigiCreateOrderResponse =
  ProdigiOrderResponse<ProdigiCreateOrderOutcome>;
export type ProdigiGetOrderResponse =
  ProdigiOrderResponse<ProdigiGetOrderOutcome>;

export type ProdigiOrderAction = {
  outcome: ProdigiGetOrderOutcome;
  cancel: {
    isAvailable: boolean;
  };
  changeRecipientDetails: {
    isAvailable: boolean;
  };
  changeShippingMethod: {
    isAvailable: boolean;
  };
  changeMetaData: {
    isAvailable: boolean;
  };
  traceParent: string;
};

export interface ProdigiCreateQuoteAsset {
  printArea: string;
}

export interface ProdigiCreateQuoteItem {
  sku: string;
  copies: number;
  attributes?: Record<string, unknown>;
  assets: ProdigiCreateQuoteAsset[];
}

export interface ProdigiCreateQuoteRequest {
  shipmentMethod?: ProdigiShippingMethod;
  destinationCountryCode: string;
  currencyCode?: string;
  items: ProdigiCreateQuoteItem[];
}

export interface ProdigiQuote {
  shipmentMethod: ProdigiShippingMethod;
  costSummary: {
    items: {
      amount: string;
      currency: string;
    };
    shipping: {
      amount: string;
      currency: string;
    };
  };
  shipments: [
    {
      carrier: {
        name: string;
        service: string;
      };
      fulfillmentLocation: {
        countryCode: string;
        labCode: string;
      };
      cost: {
        amount: string;
        currency: string;
      };
      items: string[];
    },
  ];
  items: [
    {
      id: string;
      sku: string;
      copies: number;
      unitCost: {
        amount: string;
        currency: string;
      };
      attributes: Record<string, unknown>;
      assets: [
        {
          printArea: string;
        },
      ];
    },
  ];
}

export interface ProdigiQuotes {
  outcome: ProdigiGetOrderOutcome;
  quotes: ProdigiQuote[];
}

export interface ProdigiProductDetails {
  outcome: ProdigiGetOrderOutcome;
  product: {
    sku: string;
    description: string;
    productDimensions: {
      width: number;
      height: number;
      units: "in" | "cm";
    };
    attributes: {
      wrap: string[];
    };
    printAreas: {
      default: {
        required: true;
      };
    };
    variants: [
      {
        attributes: {
          wrap: string;
        };
        shipsTo: string[];
        printAreaSizes: {
          default: {
            horizontalResolution: number;
            verticalResolution: number;
          };
        };
      },
    ];
  };
}
