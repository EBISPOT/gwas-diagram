import pandas as pd
import pickle

def get_parent_dataframe(parent_mapping_file):
    # Downloading EFO mapping file:
    parent_mapping_df = pd.read_csv(parent_mapping_file, sep='\t')  # Good.

    # Filter out onlyt the required fields:
    parent_mapping_df = parent_mapping_df[['EFO URI', 'Parent term']].drop_duplicates()

    return (parent_mapping_df)


def get_association_dataframe(association_file):

    # Downloading associations:
    association_df = pd.read_csv(association_file, sep='\t')

    # Get a list of columns we want to filter the data in the future:
    columns_to_extract = ['DATE ADDED TO CATALOG', 'PUBMEDID',
                          'REGION', 'CHR_ID',
                          'MAPPED_GENE', 'SNP_GENE_IDS',
                          'SNPS', 'CHR_POS',
                          'CONTEXT', 'INTERGENIC',
                          'PVALUE_MLOG', 'MAPPED_TRAIT_URI', 'STUDY ACCESSION']

    # Filtering columns:
    association_df = association_df[columns_to_extract]

    # Filtering rows criteria:

    # Exclude associations without mapping
    association_df = association_df.loc[~association_df.REGION.isna()]

    # Excluding associations without mapped trait:
    association_df = association_df[~association_df.MAPPED_TRAIT_URI.isna()]

    # Exclude association with multiple snps
    association_df = association_df.loc[~association_df.CHR_POS.str.contains(';')]
    association_df = association_df.loc[~association_df.CHR_POS.str.contains('x')]

    # Convert positions to int:
    association_df.CHR_POS = association_df.CHR_POS.astype('int64')

    # Split EFO trait column:
    # association_df.MAPPED_TRAIT_URI = association_df.MAPPED_TRAIT_URI.apply(lambda x: x.split(', '))

    # As a quick and dirty solution, I just exclude rows with multiple EFOs
    association_df = association_df.loc[~association_df.MAPPED_TRAIT_URI.str.contains(',')]

    # Convert date columns into integers:
    association_df['CATALOG_DATE'] = association_df['DATE ADDED TO CATALOG'].apply(lambda x: int(x.replace("-", "")))

    return (association_df)


def pool_parent_terms(parent_mapping_df,association_df):
    # Adding parent term to all rows:
    association_df['EFO_PARENT'] = ''
    for efo_uri in association_df.MAPPED_TRAIT_URI.unique():
        association_df.loc[association_df.MAPPED_TRAIT_URI == efo_uri, 'EFO_PARENT'] = \
        parent_mapping_df.loc[parent_mapping_df['EFO URI'] == efo_uri, 'Parent term'].tolist()[0]

    # Remove lines without parent mapping:
    pooled_df = association_df.loc[~association_df.EFO_PARENT.isna()]
    return pooled_df


def load_data(parent_mapping_file,association_file):

    # Load data from pickle:
    pooled_terms = pickle.load(open("/Users/dsuveges/Project/gwas-diagram/pooled_terms.pkl", "rb"))
    return pooled_terms

    # Downloading and filtering data:
    print('[Info] Downloading parent file.')
    parent_mapping_df = get_parent_dataframe(parent_mapping_file)
    print('[Info] Downloading association file.')
    association_df = get_association_dataframe(association_file)

    # Pool associations with parent terms:
    print('[Info] Adding parent terms.')
    pooled_terms = pool_parent_terms(parent_mapping_df, association_df)

    # saving data into a pickled file:
    print('[Info] Saving pickle file.')
    pickle.dump(pooled_terms, open("/Users/dsuveges/Project/gwas-diagram/pooled_terms.pkl", "wb"))


    return pooled_terms