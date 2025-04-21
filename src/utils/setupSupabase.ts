
import { supabase } from "@/integrations/supabase/client";

/**
 * This function checks and updates the Supabase schema to ensure
 * all required fields are present in the profiles table.
 */
export const setupSupabaseSchema = async () => {
  try {
    console.log("Checking Supabase schema...");
    
    // First, try to query the profiles table to see if it exists
    const { data: profilesCheck, error: profilesError } = await supabase.from('profiles')
      .select('id')
      .limit(1)
      .maybeSingle();
    
    if (profilesError) {
      console.warn("Could not query profiles table:", profilesError);
      return;
    }

    // Create a dummy schema setup record if it doesn't exist
    const { error: setupError } = await supabase.from('profiles')
      .upsert({ 
        id: 'schema_setup', 
        full_name: 'Schema Setup',
        updated_at: new Date().toISOString()
      } as any); // Use type assertion for profiles table

    if (setupError) {
      console.warn("Could not create schema setup record:", setupError);
    }

    // For the roles column, use raw SQL via RPC call
    try {
      // Define the structure for our RPC function parameters
      interface RpcParams {
        table_name: string;
        column_name: string;
      }
      
      // Use explicit type assertion for the RPC call parameters
      const checkColumnParams = { 
        table_name: 'profiles', 
        column_name: 'roles' 
      } as unknown as RpcParams;
      
      // Use type assertion to bypass TypeScript's type checking for RPC call
      const { data: rolesColumnCheck, error: rolesCheckError } = await supabase
        .rpc('check_column_exists', checkColumnParams)
        .single() as unknown as { data: boolean, error: any };

      if (!rolesCheckError && !rolesColumnCheck) {
        // The column doesn't exist, try to add it using a direct SQL query
        console.log("Adding roles column to profiles table...");
        
        try {
          // Define interface for SQL exec parameters
          interface SqlExecParams {
            sql_query: string;
          }
          
          // Define the SQL query parameters with explicit type assertion
          const sqlParams = { 
            sql_query: "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS roles JSONB DEFAULT '[]'::jsonb;" 
          } as unknown as SqlExecParams;
          
          // Type assertion for the RPC call
          const { error: createRolesError } = await supabase
            .rpc('exec_sql', sqlParams)
            .then(response => response as unknown as { error: any });
            
          if (createRolesError) {
            console.warn("Could not add roles column:", createRolesError);
            console.log("Please add the column manually in Supabase dashboard: ALTER TABLE profiles ADD COLUMN roles JSONB DEFAULT '[]'::jsonb;");
          } else {
            console.log("Roles column added successfully");
          }
        } catch (sqlError) {
          console.warn("Error executing SQL to add roles column:", sqlError);
          console.log("Please add the column manually in Supabase dashboard: ALTER TABLE profiles ADD COLUMN roles JSONB DEFAULT '[]'::jsonb;");
        }
      }
    } catch (checkError) {
      console.warn("Error checking for roles column:", checkError);
      console.log("Falling back to RLS policies for roles. Please add the column manually in Supabase dashboard.");
    }

    // For the vendor_data column, use similar approach
    try {
      // Use the same RpcParams interface defined above
      interface RpcParams {
        table_name: string;
        column_name: string;
      }
      
      // Use explicit type assertion for the RPC call parameters
      const checkColumnParams = { 
        table_name: 'profiles', 
        column_name: 'vendor_data' 
      } as unknown as RpcParams;
      
      // Use type assertion to bypass TypeScript's type checking for RPC call
      const { data: vendorDataColumnCheck, error: vendorDataCheckError } = await supabase
        .rpc('check_column_exists', checkColumnParams)
        .single() as unknown as { data: boolean, error: any };

      if (!vendorDataCheckError && !vendorDataColumnCheck) {
        // The column doesn't exist, try to add it using a direct SQL query
        console.log("Adding vendor_data column to profiles table...");
        
        try {
          // Use the same SqlExecParams interface defined above
          interface SqlExecParams {
            sql_query: string;
          }
          
          // Define the SQL query parameters with explicit type assertion
          const sqlParams = { 
            sql_query: "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS vendor_data JSONB DEFAULT NULL;" 
          } as unknown as SqlExecParams;
          
          // Type assertion for the RPC call
          const { error: createVendorDataError } = await supabase
            .rpc('exec_sql', sqlParams)
            .then(response => response as unknown as { error: any });
            
          if (createVendorDataError) {
            console.warn("Could not add vendor_data column:", createVendorDataError);
            console.log("Please add the column manually in Supabase dashboard: ALTER TABLE profiles ADD COLUMN vendor_data JSONB DEFAULT NULL;");
          } else {
            console.log("Vendor_data column added successfully");
          }
        } catch (sqlError) {
          console.warn("Error executing SQL to add vendor_data column:", sqlError);
          console.log("Please add the column manually in Supabase dashboard: ALTER TABLE profiles ADD COLUMN vendor_data JSONB DEFAULT NULL;");
        }
      }
    } catch (checkError) {
      console.warn("Error checking for vendor_data column:", checkError);
      console.log("Falling back to RLS policies for vendor_data. Please add the column manually in Supabase dashboard.");
    }
    
    console.log("Schema verification complete");
    
  } catch (error) {
    console.error("Error setting up Supabase schema:", error);
  }
};
