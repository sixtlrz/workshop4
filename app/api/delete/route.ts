import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

export async function DELETE(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const { projectId } = await request.json();

    if (!projectId) {
      return NextResponse.json(
        { error: 'ID du projet requis' },
        { status: 400 }
      );
    }

    // 1. Récupérer le projet pour obtenir les URLs des images
    const { data: project, error: fetchError } = await supabaseAdmin
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', user.id) // Vérifier que c'est bien le projet de l'utilisateur
      .single();

    if (fetchError || !project) {
      return NextResponse.json(
        { error: 'Projet non trouvé' },
        { status: 404 }
      );
    }

    // 2. Extraire les noms de fichiers des URLs
    const extractFileName = (url: string) => {
      const parts = url.split('/');
      return parts[parts.length - 1];
    };

    const inputFileName = extractFileName(project.input_image_url);
    const outputFileName = extractFileName(project.output_image_url);

    // 3. Supprimer les images des buckets
    const { error: deleteInputError } = await supabaseAdmin
      .storage
      .from(process.env.NEXT_PUBLIC_INPUT_BUCKET!)
      .remove([inputFileName]);

    const { error: deleteOutputError } = await supabaseAdmin
      .storage
      .from(process.env.NEXT_PUBLIC_OUTPUT_BUCKET!)
      .remove([outputFileName]);

    if (deleteInputError) {
      console.error('Erreur suppression image input:', deleteInputError);
    }

    if (deleteOutputError) {
      console.error('Erreur suppression image output:', deleteOutputError);
    }

    // 4. Supprimer l'enregistrement de la base de données
    const { error: deleteProjectError } = await supabaseAdmin
      .from('projects')
      .delete()
      .eq('id', projectId)
      .eq('user_id', user.id);

    if (deleteProjectError) {
      console.error('Erreur suppression projet:', deleteProjectError);
      return NextResponse.json(
        { error: 'Erreur lors de la suppression du projet', details: deleteProjectError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Projet supprimé avec succès',
    });

  } catch (error: any) {
    console.error('Erreur complète:', error);
    return NextResponse.json(
      {
        error: 'Erreur lors de la suppression',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
