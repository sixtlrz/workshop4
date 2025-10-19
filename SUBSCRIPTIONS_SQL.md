-- Création de la table des abonnements
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    stripe_price_id TEXT,
    status TEXT CHECK (status IN ('active', 'trialing', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'unpaid')) NOT NULL DEFAULT 'active',
    quota_limit INTEGER DEFAULT 0,
    quota_used INTEGER DEFAULT 0,
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Ajouter les politiques RLS pour sécuriser la table
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux utilisateurs de voir leur propre abonnement
CREATE POLICY "Users can view own subscription"
  ON public.subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Politique pour permettre aux utilisateurs d'insérer leur propre abonnement
CREATE POLICY "Users can insert own subscription"
  ON public.subscriptions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Politique pour permettre aux utilisateurs de mettre à jour leur propre abonnement
CREATE POLICY "Users can update own subscription"
  ON public.subscriptions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Politique pour permettre aux utilisateurs de supprimer leur propre abonnement
CREATE POLICY "Users can delete own subscription"
  ON public.subscriptions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Index pour améliorer les performances des requêtes
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions (user_id);
CREATE INDEX idx_subscriptions_stripe_customer_id ON public.subscriptions (stripe_customer_id);
CREATE INDEX idx_subscriptions_stripe_subscription_id ON public.subscriptions (stripe_subscription_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions (status);

-- Trigger pour mettre à jour automatiquement le champ updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_subscriptions_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();