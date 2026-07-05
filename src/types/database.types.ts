export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: 'admin' | 'customer'
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'customer'
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'customer'
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          image_url: string | null
          sort_order: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          image_url?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          image_url?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          category_id: string | null
          printful_sync_product_id: number | null
          printful_catalog_id: number | null
          printful_store_id: string | null
          design_file_url: string | null
          design_file_path: string | null
          thumbnail_url: string | null
          is_active: boolean
          is_featured: boolean
          tags: string[]
          seo_title: string | null
          seo_description: string | null
          base_price: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          category_id?: string | null
          printful_sync_product_id?: number | null
          printful_catalog_id?: number | null
          printful_store_id?: string | null
          design_file_url?: string | null
          design_file_path?: string | null
          thumbnail_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          tags?: string[]
          seo_title?: string | null
          seo_description?: string | null
          base_price?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          category_id?: string | null
          printful_sync_product_id?: number | null
          printful_catalog_id?: number | null
          printful_store_id?: string | null
          design_file_url?: string | null
          design_file_path?: string | null
          thumbnail_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          tags?: string[]
          seo_title?: string | null
          seo_description?: string | null
          base_price?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      product_variants: {
        Row: {
          id: string
          product_id: string
          printful_sync_variant_id: number | null
          printful_variant_id: number
          printful_product_id: number | null
          size: string
          color: string | null
          color_hex: string | null
          sku: string | null
          retail_price: number
          compare_at_price: number | null
          in_stock: boolean
          stock_level: number | null
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          printful_sync_variant_id?: number | null
          printful_variant_id: number
          printful_product_id?: number | null
          size: string
          color?: string | null
          color_hex?: string | null
          sku?: string | null
          retail_price: number
          compare_at_price?: number | null
          in_stock?: boolean
          stock_level?: number | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          printful_sync_variant_id?: number | null
          printful_variant_id?: number
          printful_product_id?: number | null
          size?: string
          color?: string | null
          color_hex?: string | null
          sku?: string | null
          retail_price?: number
          compare_at_price?: number | null
          in_stock?: boolean
          stock_level?: number | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      product_images: {
        Row: {
          id: string
          product_id: string
          url: string
          alt_text: string | null
          sort_order: number
          is_primary: boolean
          color: string | null
          source: string | null
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          url: string
          alt_text?: string | null
          sort_order?: number
          is_primary?: boolean
          color?: string | null
          source?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          url?: string
          alt_text?: string | null
          sort_order?: number
          is_primary?: boolean
          color?: string | null
          source?: string | null
          created_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          order_number: string
          user_id: string | null
          customer_email: string
          customer_name: string
          shipping_name: string
          shipping_address1: string
          shipping_address2: string | null
          shipping_city: string
          shipping_state: string | null
          shipping_country: string
          shipping_zip: string
          shipping_phone: string | null
          status: 'pending' | 'paid' | 'processing' | 'fulfilled' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
          stripe_session_id: string | null
          stripe_payment_intent: string | null
          subtotal: number
          shipping_cost: number
          tax: number
          total: number
          currency: string
          printful_order_id: number | null
          printful_status: string | null
          customer_notes: string | null
          internal_notes: string | null
          created_at: string
          updated_at: string
          paid_at: string | null
          fulfilled_at: string | null
          shipped_at: string | null
        }
        Insert: {
          id?: string
          order_number?: string
          user_id?: string | null
          customer_email: string
          customer_name: string
          shipping_name: string
          shipping_address1: string
          shipping_address2?: string | null
          shipping_city: string
          shipping_state?: string | null
          shipping_country?: string
          shipping_zip: string
          shipping_phone?: string | null
          status?: 'pending' | 'paid' | 'processing' | 'fulfilled' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
          stripe_session_id?: string | null
          stripe_payment_intent?: string | null
          subtotal: number
          shipping_cost?: number
          tax?: number
          total: number
          currency?: string
          printful_order_id?: number | null
          printful_status?: string | null
          customer_notes?: string | null
          internal_notes?: string | null
          created_at?: string
          updated_at?: string
          paid_at?: string | null
          fulfilled_at?: string | null
          shipped_at?: string | null
        }
        Update: {
          id?: string
          order_number?: string
          user_id?: string | null
          customer_email?: string
          customer_name?: string
          shipping_name?: string
          shipping_address1?: string
          shipping_address2?: string | null
          shipping_city?: string
          shipping_state?: string | null
          shipping_country?: string
          shipping_zip?: string
          shipping_phone?: string | null
          status?: 'pending' | 'paid' | 'processing' | 'fulfilled' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
          stripe_session_id?: string | null
          stripe_payment_intent?: string | null
          subtotal?: number
          shipping_cost?: number
          tax?: number
          total?: number
          currency?: string
          printful_order_id?: number | null
          printful_status?: string | null
          customer_notes?: string | null
          internal_notes?: string | null
          created_at?: string
          updated_at?: string
          paid_at?: string | null
          fulfilled_at?: string | null
          shipped_at?: string | null
        }
      }
      cart_items: {
        Row: {
          id: string
          user_id: string | null
          session_id: string | null
          variant_id: string
          quantity: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          session_id?: string | null
          variant_id: string
          quantity?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          session_id?: string | null
          variant_id?: string
          quantity?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
