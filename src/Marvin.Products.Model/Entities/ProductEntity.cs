﻿using Marvin.Model;
using System.Collections.Generic;

namespace Marvin.Products.Model
{
    public class ProductEntity : ModificationTrackedEntityBase
    {
        public virtual string Identifier { get; set; }
    
        public virtual short Revision { get; set; }
    
        public virtual string TypeName { get; set; }

        public virtual long CurrentVersionId { get; set; }

        public virtual ICollection<PartLink> Parts { get; set; }

        public virtual ICollection<PartLink> Parents { get; set; }

        public virtual ICollection<ProductRecipeEntity> Recipes { get; set; }

        public virtual ICollection<ProductProperties> OldVersions { get; set; }

        public virtual ProductProperties CurrentVersion { get; protected internal set; }

        public virtual ICollection<ProductDocument> Documents { get; set; }

        /// <summary>
        /// Creates a link to the current version of this product's properties.
        /// </summary>
        public void SetCurrentVersion(ProductProperties properties)
        {
            if (CurrentVersion == properties)
                return;

            if (CurrentVersion != null)
                OldVersions.Add(CurrentVersion);

            CurrentVersion = properties;
        }
    }
}