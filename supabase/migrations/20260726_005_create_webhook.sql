CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

CREATE OR REPLACE FUNCTION public.handle_new_message()
RETURNS TRIGGER AS $$
DECLARE
  -- L'URL de votre Edge Function
  edge_function_url text := 'https://evxgrbjmrwngwlyeepmm.supabase.co/functions/v1/push-notification';
  payload jsonb;
  request_id bigint;
BEGIN
  -- Construire les données à envoyer à la fonction
  payload := jsonb_build_object(
    'type', TG_OP,
    'table', TG_TABLE_NAME,
    'record', row_to_json(NEW)
  );

  -- Envoyer la requête HTTP en arrière-plan en utilisant pg_net
  SELECT net.http_post(
      url := edge_function_url,
      headers := '{"Content-Type": "application/json"}'::jsonb,
      body := payload
  ) INTO request_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer le déclencheur sur la table messages
DROP TRIGGER IF EXISTS on_message_created ON public.messages;
CREATE TRIGGER on_message_created
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_message();
