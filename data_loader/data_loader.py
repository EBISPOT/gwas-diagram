import pandas as pd
import pickle
import os
import numpy as np


def get_parent_dataframe(parent_mapping_file: str) -> pd.DataFrame:
    """Getting a mapping of EFO terms to their parent terms.

    Args:
        parent_mapping_file (str): Path to the file containing the parent mapping.
    Returns:
        pd.DataFrame: A dataframe containing the parent mapping.
    """

    # Get a list of columns we want to filter the data in the future:
    columns_to_extract = ['EFO URI', 'Parent term']

    # Downloading EFO mapping file:
    parent_mapping_df = pd.read_csv(parent_mapping_file, sep='\t')

    try:
        parent_mapping_df = parent_mapping_df[columns_to_extract]
    except KeyError:
        raise('[Error] The parent mapping data frame does not have some of the required columns ({}).'.format(
            ','.join(columns_to_extract)))

    # Filter out onlyt the required fields:
    parent_mapping_df = parent_mapping_df[['EFO URI', 'Parent term']].drop_duplicates()

    # Rename columns:
    parent_mapping_df.rename(columns={'EFO URI': 'EFO_URI',
                                      'Parent term': 'EFO_PARENT'})

    return parent_mapping_df


def get_association_dataframe(association_file: str) -> pd.DataFrame:
    """ Fetching and formatting association data.

    Args:
        association_file (str): Path to the file containing the association data.
    Returns:
        pd.DataFrame: A dataframe containing the association data.
    """

    # Downloading associations:
    association_df = pd.read_csv(association_file, sep='\t', dtype=str)

    # Get a list of columns we want to filter the data in the future:
    columns_to_extract = ['DATE ADDED TO CATALOG', 'PUBMEDID',
                          'REGION', 'CHR_ID', 'DISEASE/TRAIT',
                          'MAPPED_GENE', 'SNP_GENE_IDS',
                          'SNPS', 'CHR_POS', 'MAPPED_TRAIT',
                          'CONTEXT', 'INTERGENIC', 'INITIAL SAMPLE SIZE',
                          'REPLICATION SAMPLE SIZE',
                          'PVALUE_MLOG', 'MAPPED_TRAIT_URI', 'STUDY ACCESSION']

    # Filtering columns:
    association_df = association_df[columns_to_extract]

    # Filtering rows criteria:

    # Exclude associations without genomic mapping:
    association_df = association_df.loc[~association_df.REGION.isna()]

    # Excluding associations without mapped trait:
    association_df = association_df[~association_df.MAPPED_TRAIT_URI.isna()]

    # Excluding associations below 5e-8:
    association_df.PVALUE_MLOG = association_df.PVALUE_MLOG.astype('float')
    association_df = association_df.loc[association_df.PVALUE_MLOG > -np.log10(5e-8)]

    # Exclude association with multiple snps: <- this criteria might be too harsh
    association_df = association_df.loc[~association_df.CHR_POS.str.contains(';')]
    association_df = association_df.loc[~association_df.CHR_POS.str.contains('x')]

    # Convert positions to int:
    association_df.CHR_POS = association_df.CHR_POS.astype('int64')

    # Split EFO trait column and explode:
    association_df = (
        association_df
        .assign(MAPPED_TRAIT_URI=lambda df: df.MAPPED_TRAIT_URI.str.split(', '))
        .explode('MAPPED_TRAIT_URI')
    )

    # Pool initial and replication sample description:
    association_df['SAMPLE_DESCRIPTION'] = association_df.apply(
        lambda row: '{} {}'.format(row['INITIAL SAMPLE SIZE'], row['REPLICATION SAMPLE SIZE']), axis=1)

    # Convert date columns into integers: <- why do we need this?
    association_df['CATALOG_DATE'] = association_df['DATE ADDED TO CATALOG'].apply(lambda x: int(x.replace("-", "")))

    return association_df


def get_ancestry_dataframe(ancestry_file: str) -> pd.DataFrame:
    """ Fetching and formatting ancestry data.

    Args:
        ancestry_file (str): Path to the file containing the ancestry data.
    Returns:
        pd.DataFrame: A dataframe containing the ancestry data.
    """

    # Columns to extract:
    ancestry_columns = ['STUDY ACCESSION', 'BROAD ANCESTRAL CATEGORY']

    # Download ancestry data:
    ancestry_df = pd.read_csv(ancestry_file, sep="\t", index_col=False, usecols=ancestry_columns)

    return ancestry_df


def pool_dataframes(parent_mapping_df, association_df, ancestry_df):

    # Adding parent term to all rows:
    pooled_df = association_df.merge(parent_mapping_df, how='left', left_on='MAPPED_TRAIT_URI', right_on='EFO_URI')

    # Adding ancestry df too:
    pooled_df = pooled_df.merge(ancestry_df, how='left', left_on='STUDY ACCESSION', right_on='STUDY ACCESSION')

    # Remove lines without parent mapping: <- there should be report on this...
    pooled_df = pooled_df.loc[~pooled_df['EFO_PARENT'].isna()]
    return pooled_df


def load_data(parent_mapping_file: str, association_file: str, ancestry_file: str) -> pd.DataFrame:

    # Load data from pickle:
    scriptFolder = os.path.dirname(os.path.realpath(__file__))
    pooled_data_file = '{}/pooled_terms.pkl'.format(scriptFolder)

    try:
        print('[Info] Pooled data was found ({}). Loading...'.format(pooled_data_file))
        pooled_terms = pickle.load(open(pooled_data_file, "rb"))
        return pooled_terms

    except FileNotFoundError:

        # Downloading and filtering data:
        print('[Info] Downloading parent file.')
        parent_mapping_df = get_parent_dataframe(parent_mapping_file)
        
        print('[Info] Downloading association file.')
        association_df = get_association_dataframe(association_file)
        
        print('[Info] Downloading ancestry file.')
        ancestry_df = get_ancestry_dataframe(ancestry_file)

        # Pool associations with parent terms:
        print('[Info] Adding parent terms.')
        pooled_terms = pool_dataframes(parent_mapping_df, association_df, ancestry_df)

        # saving data into a pickled file:
        print('[Info] Saving pickle file.')
        pickle.dump(pooled_terms, open(pooled_data_file, "wb"))

        return pooled_terms


